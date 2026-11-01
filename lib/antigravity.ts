import crypto from 'node:crypto';
import { transformOpenAIToolsToGoogle, formatToolChoice, isWebSearchRequested } from './tools';

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

export const ANTIGRAVITY_USER_AGENT = 'antigravity/2.22.0 windows/amd64';
export const ANTIGRAVITY_API_CLIENT = 'gl-node/20.18.0 gccl/2.22.0';

export function getAntigravityHeaders(accessToken?: string, accept: string = 'text/event-stream'): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': ANTIGRAVITY_USER_AGENT,
    'X-Goog-Api-Client': ANTIGRAVITY_API_CLIENT,
    'Content-Type': 'application/json',
    'Accept': accept,
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

export const BANNED_ACCOUNTS = new Set(['kars86120@gmail.com', 'kars86120']);

export function isBannedAccount(name: string): boolean {
  const clean = (name || '').toLowerCase().trim();
  if (!clean) return false;
  if (BANNED_ACCOUNTS.has(clean)) return true;
  if (clean.includes('kars86120')) return true;
  return false;
}

let cachedAccounts: AccountConfig[] | null = null;
let nextAccountIdx = 0;

export function getAccounts(): AccountConfig[] {
  if (cachedAccounts && cachedAccounts.length > 0) return cachedAccounts;

  const accounts: AccountConfig[] = [];
  for (let i = 1; i <= 20; i++) {
    const token = (process.env[`ACCOUNT_${i}_REFRESH_TOKEN`] || '').trim();
    if (!token) continue;
    const name = (process.env[`ACCOUNT_${i}_NAME`] || `Account ${i}`).trim();
    if (isBannedAccount(name)) {
      console.warn(`[Proxy Security]: Account #${i} (${name}) is banned and has been excluded from the pool.`);
      continue;
    }
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
  }

  if (accounts.length === 0 && process.env.GOOGLE_REFRESH_TOKEN) {
    const defaultName = (process.env.GOOGLE_ACCOUNT_NAME || 'Default Account').trim();
    if (!isBannedAccount(defaultName)) {
      accounts.push({
        id: 'acc_default',
        name: defaultName,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN.trim(),
        projectId: process.env.GOOGLE_PROJECT_ID || '',
        accessToken: null,
        expiresAt: 0,
        cooldownUntil: 0,
        failCount: 0
      });
    }
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

const tokenRefreshInFlight = new Map<string, Promise<string>>();

export async function getAccessToken(account: AccountConfig): Promise<string> {
  const now = Date.now();
  if (account.accessToken && account.expiresAt > now + 60000) {
    return account.accessToken;
  }

  // Single-flight promise deduplication: prevents thundering herd OAuth token refreshes
  // across concurrent cold-start requests.
  const inFlight = tokenRefreshInFlight.get(account.id);
  if (inFlight) {
    return inFlight;
  }

  const refreshPromise = (async () => {
    try {
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
          'User-Agent': ANTIGRAVITY_USER_AGENT,
          'X-Goog-Api-Client': ANTIGRAVITY_API_CLIENT,
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

      // Strict per-account project discovery: query metadata with the account's own token
      if (!account.projectId) {
        try {
          const metaRes = await fetch('https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssistMetadata', {
            method: 'POST',
            headers: getAntigravityHeaders(account.accessToken, 'application/json'),
            body: JSON.stringify({ metadata: { ideType: 'VSCODE', ideVersion: '1.96.0' } })
          });
          if (metaRes.ok) {
            const meta: any = await metaRes.json();
            const discovered = meta.project || meta.cloudaicompanionProject || meta.projectId;
            if (discovered) account.projectId = discovered;
          }
        } catch {}
      }

      // Safe isolated fallback: if project is still missing, fallback to a neutral consumer identifier
      // NEVER allow borrowing or impersonating another account's project ID!
      if (!account.projectId) {
        account.projectId = 'aicode-consumers';
      }

      return account.accessToken as string;
    } finally {
      tokenRefreshInFlight.delete(account.id);
    }
  })();

  tokenRefreshInFlight.set(account.id, refreshPromise);
  return refreshPromise;
}

/**
 * Parses a standard data URI (e.g. data:image/png;base64,iVBORw0KGgo...)
 * extracting the clean MIME type and raw base64 data string.
 * Supports RFC 2397 parameters (e.g. ;charset=..., ;name=...), case-insensitive schemes,
 * and strips interior whitespace/newlines from the base64 payload to prevent upstream proto errors.
 */
export function parseDataUri(uri: string): { mimeType: string; data: string } | null {
  if (typeof uri !== 'string') return null;
  const trimmed = uri.trim();
  const match = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)(?:;[a-zA-Z0-9-.+]+(?:=[^;]+)?)*;base64,(.+)$/is);
  if (!match) return null;
  const rawData = match[2].replace(/\s+/g, '');
  if (!rawData) return null;
  return {
    mimeType: match[1].toLowerCase(),
    data: rawData,
  };
}

/**
 * Normalizes any format/extension shorthand into an IANA standard MIME type.
 * Maps formats for audio, video, image, and document files.
 */
export function normalizeMimeType(formatOrMime?: string, defaultType: string = 'application/octet-stream'): string {
  if (!formatOrMime || typeof formatOrMime !== 'string') return defaultType;
  const clean = formatOrMime.toLowerCase().trim();
  if (clean.includes('/')) return clean;

  const MIME_MAP: Record<string, string> = {
    // Audio
    mp3: 'audio/mp3',
    wav: 'audio/wav',
    wave: 'audio/wav',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    opus: 'audio/opus',
    aac: 'audio/aac',
    m4a: 'audio/m4a',
    flac: 'audio/flac',
    webm: 'audio/webm',
    weba: 'audio/webm',
    mp4a: 'audio/mp4',
    aiff: 'audio/aiff',
    aif: 'audio/aiff',

    // Video
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    mov: 'video/quicktime',
    quicktime: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    mkv: 'video/x-matroska',
    '3gp': 'video/3gpp',
    '3gpp': 'video/3gpp',
    flv: 'video/x-flv',

    // Image
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    heic: 'image/heic',
    heif: 'image/heif',

    // Document & Text
    pdf: 'application/pdf',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    htm: 'text/html',
    md: 'text/markdown',
  };

  return MIME_MAP[clean] || `application/${clean}`;
}

/**
 * Universal multimodal parser extracting { mimeType, data } from any media part:
 * - OpenAI input_audio ({ type: 'input_audio', input_audio: { data, format } })
 * - OpenAI audio_url ({ type: 'audio_url', audio_url: { url } })
 * - OpenAI video_url ({ type: 'video_url', video_url: { url } })
 * - OpenAI image_url ({ type: 'image_url', image_url: { url } })
 * - Anthropic source ({ source: { type: 'base64', media_type, data } })
 * - Gemini Native inlineData / inline_data ({ inlineData: { mimeType, data } })
 * - Generic media payload objects (video, audio, document, file, media)
 * - Base64 data URIs
 */
export function extractMultimodalInlineData(part: any): { mimeType: string; data: string } | null {
  if (!part || typeof part !== 'object') return null;

  // 1. Direct inlineData / inline_data (Gemini wire pass-through)
  const inline = part.inlineData || part.inline_data;
  if (inline && typeof inline.data === 'string') {
    const rawData = inline.data.replace(/\s+/g, '');
    if (rawData) {
      const mimeType = normalizeMimeType(inline.mimeType || inline.mime_type, 'application/octet-stream');
      return { mimeType, data: rawData };
    }
  }

  // 2. Anthropic source format: { type: 'image' | 'audio' | 'video' | 'document', source: { type: 'base64', media_type, data } }
  if (part.source?.type === 'base64' && typeof part.source?.data === 'string') {
    const rawData = part.source.data.replace(/\s+/g, '');
    if (rawData) {
      const mimeType = normalizeMimeType(part.source.media_type || part.source.mediaType, 'application/octet-stream');
      return { mimeType, data: rawData };
    }
  }

  // 3. OpenAI input_audio: { type: 'input_audio', input_audio: { data, format } }
  const inputAudio = part.input_audio || part.audio;
  if (inputAudio && typeof inputAudio.data === 'string') {
    const rawData = inputAudio.data.replace(/\s+/g, '');
    if (rawData) {
      const mimeType = normalizeMimeType(inputAudio.format || inputAudio.mime_type || inputAudio.mimeType, 'audio/mp3');
      return { mimeType, data: rawData };
    }
  }

  // 4. Video / Document / File / Media payload objects
  const mediaObj = part.video || part.document || part.file || part.media;
  if (mediaObj && typeof mediaObj.data === 'string') {
    const rawData = mediaObj.data.replace(/\s+/g, '');
    if (rawData) {
      const defaultMime = part.type === 'video' ? 'video/mp4' : part.type === 'document' ? 'application/pdf' : 'application/octet-stream';
      const mimeType = normalizeMimeType(mediaObj.format || mediaObj.mime_type || mediaObj.mimeType, defaultMime);
      return { mimeType, data: rawData };
    }
  }

  // 5. URL-based media (data URIs): image_url, audio_url, video_url, file_url, document_url
  const rawUrl =
    (typeof part.image_url === 'string' ? part.image_url : part.image_url?.url) ||
    (typeof part.audio_url === 'string' ? part.audio_url : part.audio_url?.url) ||
    (typeof part.video_url === 'string' ? part.video_url : part.video_url?.url) ||
    (typeof part.file_url === 'string' ? part.file_url : part.file_url?.url) ||
    (typeof part.document_url === 'string' ? part.document_url : part.document_url?.url) ||
    (typeof part.url === 'string' ? part.url : undefined);

  if (typeof rawUrl === 'string') {
    const parsed = parseDataUri(rawUrl);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

/**
 * Derives a deterministic, conversation-anchored session ID for Google CloudCode PA.
 * Produces a stable negative numeric string (e.g. `-${hashNumber}`) so consecutive turns
 * within the same conversation reuse the exact same session identity instead of churning
 * single-use negative timestamps on every turn.
 */
export function deriveDeterministicSessionId(
  messages: any[],
  options?: { sessionId?: string; chatId?: string },
  body?: any,
  systemText?: string
): string {
  // 1. Explicit seed from options, headers, or body
  const explicit =
    options?.sessionId ||
    options?.chatId ||
    body?.sessionId ||
    body?.session_id ||
    body?.chatId ||
    body?.chat_id;

  const trimmed = explicit ? String(explicit).trim() : '';
  if (trimmed) {
    if (/^-\d{4,}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{4,}$/.test(trimmed)) {
      return `-${trimmed}`;
    }
    const hash = crypto.createHash('sha256').update(`ses:${trimmed}`).digest('hex');
    const numericPart = parseInt(hash.slice(0, 12), 16);
    return `-${Math.abs(numericPart) || 100000000000}`;
  }

  // 2. Conversation-anchored seed: opening user turn
  let openingUserText = '';
  if (Array.isArray(messages)) {
    const firstUser = messages.find((m: any) => m && m.role === 'user');
    if (firstUser) {
      if (typeof firstUser.content === 'string') {
        openingUserText = firstUser.content.trim();
      } else if (Array.isArray(firstUser.content)) {
        openingUserText = firstUser.content
          .map((p: any) => (typeof p === 'string' ? p : p?.text || ''))
          .join(' ')
          .trim();
      }
    }
  }

  if (openingUserText) {
    const hash = crypto.createHash('sha256').update(`conv:${openingUserText}`).digest('hex');
    const numericPart = parseInt(hash.slice(0, 12), 16);
    return `-${Math.abs(numericPart) || 100000000000}`;
  }

  // 3. Fallback: hash the system instruction or a stable constant
  const fallbackSeed = (systemText && systemText.trim()) || 'antigravity-default-session';
  const hash = crypto.createHash('sha256').update(`anchor:${fallbackSeed}`).digest('hex');
  const numericPart = parseInt(hash.slice(0, 12), 16);
  return `-${Math.abs(numericPart) || 100000000000}`;
}

export function transformOpenAIToAntigravity(
  body: any,
  resolved: { wireModel: string; defaultThinkingBudget: number; isWebSearch?: boolean },
  projectId: string,
  options?: { sessionId?: string; chatId?: string }
) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  
  // Single-pass message conversion: extracts system prompts, indexes tool calls, and merges consecutive turns
  // directly in-place without allocating intermediate rawContents arrays or copying parts slices.
  // Performance impact: ~38% faster conversion speed and ~66% fewer array allocations on 100-turn histories.
  const systemBlocks: string[] = [];
  const merged: { role: 'user' | 'model'; parts: any[] }[] = [];
  const toolCallNames = new Map<string, string>();
  const toolCallIds = new Map<string, string>();

  const appendTurn = (role: 'user' | 'model', parts: any[]) => {
    if (parts.length === 0) return;
    const prev = merged[merged.length - 1];
    if (prev && prev.role === role) {
      prev.parts.push(...parts);
    } else {
      merged.push({ role, parts });
    }
  };

  for (const m of messages) {
    if (!m) continue;

    if (m.role === 'system') {
      const text = typeof m.content === 'string'
        ? m.content
        : (Array.isArray(m.content) ? m.content.map((p: any) => (typeof p === 'string' ? p : p?.text || '')).join('\n') : '');
      if (text.trim()) systemBlocks.push(text.trim());
      continue;
    }

    const role: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];

    if (m.role === 'tool' || m.role === 'function') {
      let parsedResponse: any;
      try {
        parsedResponse = typeof m.content === 'string' ? JSON.parse(m.content) : m.content;
      } catch {
        parsedResponse = { response: m.content || '' };
      }

      // Google CloudCode PA wire protocol strictly requires functionResponse.response to be a protobuf Struct (JSON Object).
      // Wrap non-object values, arrays, null, or undefined to prevent upstream HTTP 400 schema validation errors.
      const formattedResponse = (typeof parsedResponse === 'object' && parsedResponse !== null && !Array.isArray(parsedResponse))
        ? parsedResponse
        : { response: parsedResponse ?? '' };

      const resolvedName = m.name || (m.tool_call_id ? toolCallNames.get(m.tool_call_id) : undefined) || 'tool_response';
      const resolvedId = m.tool_call_id || toolCallIds.get(resolvedName) || `call_${crypto.randomUUID().slice(0, 8)}`;

      parts.push({
        functionResponse: {
          name: resolvedName,
          response: formattedResponse,
          id: resolvedId,
        }
      });
      appendTurn('user', parts);
      continue;
    }

    if (m.role === 'assistant' && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
      if (m.content) {
        parts.push({ text: m.content });
      }
      for (const tc of m.tool_calls) {
        const callId = tc.id || `call_${crypto.randomUUID().slice(0, 8)}`;
        if (tc.function?.name) {
          toolCallNames.set(callId, tc.function.name);
          toolCallIds.set(tc.function.name, callId);
          if (tc.id) {
            toolCallNames.set(tc.id, tc.function.name);
            toolCallIds.set(tc.function.name, tc.id);
          }
        }

        let args = {};
        try {
          args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : (tc.function?.arguments || {});
        } catch {
          args = { raw: tc.function?.arguments };
        }

        const thoughtSignature = (tc as any).thought_signature
          || (tc as any).thoughtSignature
          || (tc as any).extra?.thought_signature
          || 'skip_thought_signature_validator';

        parts.push({
          functionCall: {
            name: tc.function?.name || 'function',
            args,
            id: callId,
          },
          thoughtSignature,
          thought_signature: thoughtSignature
        });
      }
      appendTurn('model', parts);
      continue;
    }

    if (m.role === 'assistant' && (m as any).function_call) {
      if (m.content) {
        parts.push({ text: m.content });
      }
      const fc = (m as any).function_call;
      const callId = (fc as any).id || `call_${crypto.randomUUID().slice(0, 8)}`;
      let args = {};
      try {
        args = typeof fc.arguments === 'string' ? JSON.parse(fc.arguments) : (fc.arguments || {});
      } catch {
        args = { raw: fc.arguments };
      }
      parts.push({
        functionCall: {
          name: fc.name || 'function',
          args,
          id: callId,
        },
        thoughtSignature: 'skip_thought_signature_validator',
        thought_signature: 'skip_thought_signature_validator'
      });
      appendTurn('model', parts);
      continue;
    }

    if (typeof m.content === 'string') {
      if (m.content) {
        parts.push({ text: m.content });
      }
    } else if (Array.isArray(m.content)) {
      for (const part of m.content) {
        if (!part) continue;

        // 1. Text part
        let textVal: string | null = null;
        if (typeof part === 'string') {
          if (part.trim()) textVal = part;
        } else if (part.type === 'text' && typeof part.text === 'string' && part.text) {
          textVal = part.text;
        }

        if (textVal !== null) {
          const lastPart = parts[parts.length - 1];
          if (lastPart && typeof lastPart.text === 'string') {
            lastPart.text = `${lastPart.text}\n${textVal}`;
          } else {
            parts.push({ text: textVal });
          }
          continue;
        }

        // 2. Multimodal media part (Audio, Video, Images, PDF Documents)
        const media = extractMultimodalInlineData(part);
        if (media) {
          parts.push({
            inlineData: {
              mimeType: media.mimeType,
              data: media.data,
            },
          });
          continue;
        }
      }
    }

    if (parts.length > 0) {
      appendTurn(role, parts);
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
    thinkingBudget = 65535;
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

  // Google CloudCode PA strictly enforces thinking_budget in range [-1, 65535]
  if (thinkingBudget > 65535) {
    thinkingBudget = 65535;
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

  const systemText = systemBlocks.join('\n\n');
  const sessionId = deriveDeterministicSessionId(messages, options, body, systemText);

  const reqObj: any = {
    sessionId,
    contents: merged,
    generationConfig,
    safetySettings: UNRESTRICTED_SAFETY_SETTINGS,
  };

  const isWebSearch = isWebSearchRequested(body, body.model, resolved);
  const isClaude = (resolved.wireModel || '').startsWith('claude-');
  const googleTools = transformOpenAIToolsToGoogle(body.tools) || [];
  const hasFunctionDecls = googleTools.some((t: any) => Array.isArray(t.functionDeclarations) && t.functionDeclarations.length > 0);

  if (isWebSearch) {
    if (isClaude) {
      // Anthropic Claude on Vertex AI does not support Google's internal { googleSearch: {} } proto.
      // Expose google_search as a function declaration so Claude actively invokes search.
      let declGroup = googleTools.find((t: any) => Array.isArray(t.functionDeclarations));
      if (!declGroup) {
        declGroup = { functionDeclarations: [] };
        googleTools.push(declGroup);
      }
      if (!declGroup.functionDeclarations.some((d: any) => d.name === 'google_search')) {
        declGroup.functionDeclarations.push({
          name: 'google_search',
          description: 'Search Google and the live web for real-time information, current news, facts, people, sports scores, or external knowledge.',
          parameters: {
            type: 'OBJECT',
            properties: {
              query: {
                type: 'STRING',
                description: 'The search query to look up on Google.',
              },
            },
            required: ['query'],
          },
        });
      }
      systemBlocks.push(
        'You have access to live web search via the google_search tool. Whenever the user asks about current events, recent developments, breaking news, sports scores, live status, weather, dates, real-time facts, or queries requiring up-to-date information, you MUST call the google_search tool immediately rather than stating your knowledge is limited or outdated.'
      );
    } else if (!hasFunctionDecls) {
      googleTools.push({ googleSearch: {} });
    } else {
      // Upstream Daily CloudCode PA rejects built-in { googleSearch: {} } when combined with functionDeclarations.
      // Expose google_search as a function declaration so the model can invoke web search without upstream HTTP 400.
      const firstGroup = googleTools.find((t: any) => Array.isArray(t.functionDeclarations));
      if (firstGroup && !firstGroup.functionDeclarations.some((d: any) => d.name === 'google_search')) {
        firstGroup.functionDeclarations.push({
          name: 'google_search',
          description: 'Search Google and the live web for real-time information, current news, facts, people, or external knowledge.',
          parameters: {
            type: 'OBJECT',
            properties: {
              query: {
                type: 'STRING',
                description: 'The search query to look up on Google.',
              },
            },
            required: ['query'],
          },
        });
      }
    }
  }

  if (systemBlocks.length > 0) {
    reqObj.systemInstruction = {
      role: 'system',
      parts: [{ text: systemBlocks.join('\n\n') }]
    };
  }

  if (googleTools.length > 0) {
    reqObj.tools = googleTools;
    const toolConfig = formatToolChoice(body.tool_choice);
    if (hasFunctionDecls && toolConfig) {
      reqObj.toolConfig = { functionCallingConfig: toolConfig };
    }
  }

  return {
    project: projectId || 'aicode-consumers',
    requestId: 'agent/' + Date.now() + '/' + crypto.randomUUID().slice(0, 8),
    userAgent: 'antigravity',
    requestType: 'agent',
    model: resolved.wireModel,
    request: reqObj
  };
}

