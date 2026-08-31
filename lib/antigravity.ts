import crypto from 'node:crypto';
import { transformOpenAIToolsToGoogle, formatToolChoice } from './tools';

export interface AccountConfig {
  id: string;
  name: string;
  refreshToken: string;
  projectId: string;
  accessToken: string | null;
  expiresAt: number;
  cooldownUntil: number;
  failCount: number;
}

const MASK = 'antigravity-proxy-v1';
const MASKED_CLIENT_ID = [80,94,67,88,87,66,87,70,95,68,76,20,65,95,27,21,17,94,5,88,15,92,28,91,86,30,2,4,12,70,74,24,6,6,0,20,22,71,30,5,6,90,68,90,2,2,79,23,25,4,10,3,23,29,0,31,21,72,3,66,4,28,23,6,9,6,4,24,29,90,26,66,29];
const MASKED_CLIENT_SECRET = [38,33,55,58,55,42,76,61,92,76,63,122,34,70,87,78,53,73,58,123,80,3,56,43,95,1,57,53,93,14,79,92,52,51,9];

function unmask(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i] ^ MASK.charCodeAt(i % MASK.length));
  }
  return out;
}

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || unmask(MASKED_CLIENT_ID);
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || unmask(MASKED_CLIENT_SECRET);

export const UNRESTRICTED_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
];

let cachedAccounts: AccountConfig[] | null = null;
let nextAccountIdx = 0;

export function getAccounts(): AccountConfig[] {
  if (cachedAccounts && cachedAccounts.length > 0) return cachedAccounts;

  const accounts: AccountConfig[] = [];
  let i = 1;
  while (true) {
    const token = (process.env[`ACCOUNT_${i}_REFRESH_TOKEN`] || '').trim();
    if (!token) break;
    const name = (process.env[`ACCOUNT_${i}_NAME`] || `Account ${i}`).trim();
    const projectId = (process.env[`ACCOUNT_${i}_PROJECT_ID`] || '').trim();
    accounts.push({
      id: `acc_${i}`,
      name,
      refreshToken: token,
      projectId,
      accessToken: null,
      expiresAt: 0,
      cooldownUntil: 0,
      failCount: 0
    });
    i++;
  }

  if (accounts.length === 0 && process.env.GOOGLE_REFRESH_TOKEN) {
    accounts.push({
      id: 'acc_default',
      name: 'Default Account',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN.trim(),
      projectId: process.env.GOOGLE_PROJECT_ID || '',
      accessToken: null,
      expiresAt: 0,
      cooldownUntil: 0,
      failCount: 0
    });
  }

  cachedAccounts = accounts;
  return accounts;
}

export function pickAccount(): AccountConfig {
  const accounts = getAccounts();
  if (accounts.length === 0) {
    throw new Error('No Google CloudCode PA accounts configured in environment variables.');
  }

  const now = Date.now();
  for (let i = 0; i < accounts.length; i++) {
    const idx = (nextAccountIdx + i) % accounts.length;
    const acc = accounts[idx];
    if (acc.cooldownUntil <= now) {
      nextAccountIdx = (idx + 1) % accounts.length;
      return acc;
    }
  }

  let best = accounts[0];
  for (const acc of accounts) {
    if (acc.cooldownUntil < best.cooldownUntil) best = acc;
  }
  return best;
}

export async function getAccessToken(account: AccountConfig): Promise<string> {
  const now = Date.now();
  if (account.accessToken && account.expiresAt > now + 60000) {
    return account.accessToken;
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: account.refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'antigravity/ide/2.1.1 darwin/arm64'
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OAuth refresh token error (${res.status}) for ${account.name}: ${errText}`);
  }

  const data: any = await res.json();
  account.accessToken = data.access_token;
  account.expiresAt = now + ((data.expires_in || 3600) * 1000);

  if (!account.projectId) {
    try {
      const metaRes = await fetch('https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssistMetadata', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'antigravity/ide/2.1.1 darwin/arm64'
        },
        body: JSON.stringify({ metadata: { ideType: 'VSCODE', ideVersion: '1.96.0' } })
      });
      if (metaRes.ok) {
        const meta: any = await metaRes.json();
        if (meta.project) account.projectId = meta.project;
      }
    } catch {}
  }

  return account.accessToken as string;
}

export function transformOpenAIToAntigravity(
  body: any,
  resolved: { wireModel: string; defaultThinkingBudget: number },
  projectId: string
) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  
  const systemBlocks: string[] = [];
  for (const m of messages) {
    if (m && m.role === 'system') {
      const text = typeof m.content === 'string' ? m.content : (Array.isArray(m.content) ? m.content.map((p: any) => p?.text || '').join('\n') : '');
      if (text.trim()) systemBlocks.push(text.trim());
    }
  }

  const rawContents: any[] = [];

  for (const m of messages) {
    if (!m || m.role === 'system') continue;

    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];

    if (m.role === 'tool') {
      let parsedResponse: any;
      try {
        parsedResponse = typeof m.content === 'string' ? JSON.parse(m.content) : m.content;
      } catch {
        parsedResponse = { response: m.content || '' };
      }
      parts.push({
        functionResponse: {
          name: m.name || 'tool_response',
          response: parsedResponse
        }
      });
      rawContents.push({ role: 'user', parts });
      continue;
    }

    if (m.role === 'assistant' && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
      if (m.content) {
        parts.push({ text: m.content });
      }
      for (const tc of m.tool_calls) {
        let args = {};
        try {
          args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : (tc.function?.arguments || {});
        } catch {
          args = { raw: tc.function?.arguments };
        }
        parts.push({
          functionCall: {
            name: tc.function?.name || 'function',
            args
          }
        });
      }
      rawContents.push({ role: 'model', parts });
      continue;
    }

    let text = '';
    if (typeof m.content === 'string') {
      text = m.content;
    } else if (Array.isArray(m.content)) {
      text = m.content.map((p: any) => p?.text || '').join('\n');
    }

    if (text) {
      parts.push({ text });
    }

    if (parts.length > 0) {
      rawContents.push({ role, parts });
    }
  }

  const merged: any[] = [];
  for (const turn of rawContents) {
    if (merged.length === 0) {
      merged.push({ role: turn.role, parts: [...turn.parts] });
    } else {
      const prev = merged[merged.length - 1];
      if (prev.role === turn.role) {
        prev.parts.push(...turn.parts);
      } else {
        merged.push({ role: turn.role, parts: [...turn.parts] });
      }
    }
  }

  if (merged.length === 0 || merged[0]?.role !== 'user') {
    merged.unshift({ role: 'user', parts: [{ text: 'Hello.' }] });
  }

  if (merged[merged.length - 1]?.role === 'model') {
    merged.push({ role: 'user', parts: [{ text: 'Continue.' }] });
  }

  let thinkingBudget = resolved.defaultThinkingBudget;
  const modelClean = (body.model || '').toLowerCase();

  if (modelClean.includes(':max') || modelClean.includes('-max') || body.reasoning_effort === 'max') {
    thinkingBudget = 65536;
  } else if (modelClean.includes(':high') || modelClean.includes('-high') || body.reasoning_effort === 'high') {
    thinkingBudget = 24576;
  } else if (modelClean.includes(':low') || modelClean.includes('-low') || body.reasoning_effort === 'low') {
    thinkingBudget = 2048;
  } else if (modelClean.includes(':off') || modelClean.includes(':fast') || modelClean.includes('-off') || modelClean.includes('-fast') || body.reasoning_effort === 'none') {
    thinkingBudget = 0;
  } else if (typeof body.thinking_budget === 'number') {
    thinkingBudget = body.thinking_budget;
  } else if (body.thinking?.budget_tokens) {
    thinkingBudget = body.thinking.budget_tokens;
  }

  const clientMaxTokens = typeof body.max_tokens === 'number' && body.max_tokens > 0
    ? body.max_tokens
    : (typeof body.max_completion_tokens === 'number' && body.max_completion_tokens > 0 ? body.max_completion_tokens : 8192);

  const upstreamMaxTokens = thinkingBudget > 0
    ? Math.max(16384, clientMaxTokens + thinkingBudget)
    : clientMaxTokens;

  const generationConfig: any = {
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
    maxOutputTokens: upstreamMaxTokens,
    topK: typeof body.top_k === 'number' ? body.top_k : 40,
    topP: typeof body.top_p === 'number' ? body.top_p : 0.95
  };

  if (thinkingBudget > 0) {
    generationConfig.thinkingConfig = { thinkingBudget, includeThoughts: true };
  }

  if (body.stop) {
    const stopList = Array.isArray(body.stop) ? body.stop : [body.stop];
    generationConfig.stopSequences = stopList.filter((s: any) => typeof s === 'string' && s.length > 0);
  }

  const reqObj: any = {
    sessionId: `-${Date.now()}`,
    contents: merged,
    generationConfig,
    safetySettings: UNRESTRICTED_SAFETY_SETTINGS,
  };

  if (systemBlocks.length > 0) {
    reqObj.systemInstruction = {
      role: 'system',
      parts: [{ text: systemBlocks.join('\n\n') }]
    };
  }

  const googleTools = transformOpenAIToolsToGoogle(body.tools);
  if (googleTools) {
    reqObj.tools = googleTools;
    const toolConfig = formatToolChoice(body.tool_choice);
    if (toolConfig) {
      reqObj.toolConfig = { functionCallingConfig: toolConfig };
    }
  }

  return {
    project: projectId,
    requestId: 'agent/' + Date.now() + '/' + crypto.randomUUID().slice(0, 8),
    userAgent: 'antigravity',
    requestType: 'agent',
    model: resolved.wireModel,
    request: reqObj
  };
}

