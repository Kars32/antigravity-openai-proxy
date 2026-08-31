import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  getAccounts,
  pickAccount,
  getAccessToken,
  transformOpenAIToAntigravity,
} from './antigravity';
import { resolveModel } from './models';

const UPSTREAM_URLS = [
  'https://daily-cloudcode-pa.googleapis.com/v1internal:streamGenerateContent?alt=sse',
  'https://cloudcode-pa.googleapis.com/v1internal:streamGenerateContent?alt=sse',
];

export function checkAuth(req: NextRequest): boolean {
  const proxyKey = process.env.PROXY_API_KEY;
  if (!proxyKey) return true;
  const authHeader = req.headers.get('authorization') || '';
  const customKey = req.headers.get('api-key') || req.headers.get('x-api-key') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : customKey.trim();
  return token === proxyKey.trim();
}

export async function handleOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, api-key, x-api-key',
    },
  });
}

export async function handleChatCompletions(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: { message: 'Unauthorized. Invalid or missing API key.', type: 'invalid_request_error', code: 401 } },
      { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: 'Invalid JSON body.', type: 'invalid_request_error', code: 400 } },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const modelId = body.model || 'gemini-3.7-flash';
  const resolved = resolveModel(modelId);

  const stream = body.stream === true;
  const accounts = getAccounts();

  if (accounts.length === 0) {
    return NextResponse.json(
      { error: { message: 'No Google CloudCode PA accounts configured.', type: 'server_error', code: 500 } },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const now = Date.now();
  const availableAccounts = accounts.filter(a => a.cooldownUntil <= now);

  if (availableAccounts.length === 0) {
    const minWaitMs = Math.min(...accounts.map(a => a.cooldownUntil - now));
    const waitSec = Math.max(1, Math.ceil(minWaitMs / 1000));
    return NextResponse.json(
      {
        error: {
          message: `All accounts are cooling down from rate limits. Retry in ${waitSec}s.`,
          type: 'upstream_rate_limit',
          code: 429,
          retry_after: waitSec
        }
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(waitSec),
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  let primaryAccount = availableAccounts[0];
  try {
    primaryAccount = pickAccount();
  } catch {
    primaryAccount = availableAccounts[0];
  }

  const otherAccounts = accounts.filter(a => a.id !== primaryAccount?.id);
  const accountsToTry = primaryAccount ? [primaryAccount, ...otherAccounts] : accounts;

  const attemptLogs: { account: string; status: number; error: string }[] = [];

  for (const account of accountsToTry) {
    try {
      const accessToken = await getAccessToken(account);
      const envelope = transformOpenAIToAntigravity(body, resolved!, account.projectId);

      let upstreamRes: Response | null = null;
      for (const upstreamUrl of UPSTREAM_URLS) {
        try {
          const res = await fetch(upstreamUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
              'User-Agent': 'antigravity/ide/2.1.1 darwin/arm64',
            },
            body: JSON.stringify(envelope),
          });

          if (res.ok) {
            upstreamRes = res;
            break;
          } else if (res.status === 429) {
            attemptLogs.push({ account: account.name, status: 429, error: `Rate limited on ${upstreamUrl}` });
            continue;
          } else {
            const errText = await res.text();
            attemptLogs.push({ account: account.name, status: res.status, error: errText.slice(0, 300) });
          }
        } catch (e: any) {
          attemptLogs.push({ account: account.name, status: 500, error: e.message || 'Connection error' });
        }
      }

      if (!upstreamRes) {
        account.failCount++;
        const hasRateLimit = attemptLogs.some(l => l.account === account.name && (l.status === 429 || l.status === 503));
        if (hasRateLimit) {
          account.cooldownUntil = Date.now() + 20000;
        }
        continue;
      }

      account.failCount = 0;
      account.cooldownUntil = 0;

      // 1. Streaming Response
      if (stream) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const chatcmplId = `chatcmpl-${crypto.randomUUID().slice(0, 8)}`;
        let toolCallIndex = 0;

        const customStream = new ReadableStream({
          async start(controller) {
            try {
              const reader = upstreamRes!.body?.getReader();
              if (!reader) {
                controller.close();
                return;
              }

              let buffer = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const parsed = JSON.parse(line.slice(6));
                      const cand = parsed.response?.candidates?.[0];
                      const parts = cand?.content?.parts || [];

                      for (const part of parts) {
                        if (part.thought) {
                          const text = part.text || '';
                          if (text) {
                            controller.enqueue(
                              encoder.encode(
                                `data: ${JSON.stringify({
                                  id: chatcmplId,
                                  object: 'chat.completion.chunk',
                                  created: Math.floor(Date.now() / 1000),
                                  model: modelId,
                                  choices: [
                                    {
                                      index: 0,
                                      delta: { reasoning_content: text },
                                      finish_reason: null,
                                    },
                                  ],
                                })}\n\n`
                              )
                            );
                          }
                        }

                        if (part.text && !part.thought) {
                          controller.enqueue(
                            encoder.encode(
                              `data: ${JSON.stringify({
                                id: chatcmplId,
                                object: 'chat.completion.chunk',
                                created: Math.floor(Date.now() / 1000),
                                model: modelId,
                                choices: [
                                  {
                                    index: 0,
                                    delta: { content: part.text },
                                    finish_reason: cand.finishReason || null,
                                  },
                                ],
                              })}\n\n`
                            )
                          );
                        }

                        if (part.functionCall) {
                          controller.enqueue(
                            encoder.encode(
                              `data: ${JSON.stringify({
                                id: chatcmplId,
                                object: 'chat.completion.chunk',
                                created: Math.floor(Date.now() / 1000),
                                model: modelId,
                                choices: [
                                  {
                                    index: 0,
                                    delta: {
                                      tool_calls: [
                                        {
                                          index: toolCallIndex++,
                                          id: `call_${crypto.randomUUID().slice(0, 8)}`,
                                          type: 'function',
                                          function: {
                                            name: part.functionCall.name,
                                            arguments: JSON.stringify(part.functionCall.args || {}),
                                          },
                                        },
                                      ],
                                    },
                                    finish_reason: 'tool_calls',
                                  },
                                ],
                              })}\n\n`
                            )
                          );
                        }
                      }
                    } catch {}
                  }
                }
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    id: chatcmplId,
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: modelId,
                    choices: [
                      {
                        index: 0,
                        delta: {},
                        finish_reason: 'stop',
                      },
                    ],
                  })}\n\n`
                )
              );
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new NextResponse(customStream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 2. Non-Streaming JSON Response
      const rawText = await upstreamRes.text();
      let contentText = '';
      let thoughtText = '';
      const toolCalls: any[] = [];

      const lines = rawText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            const cand = parsed.response?.candidates?.[0];
            const parts = cand?.content?.parts || [];
            for (const part of parts) {
              if (part.thought) {
                thoughtText += part.text || '';
              } else if (part.text) {
                contentText += part.text;
              }
              if (part.functionCall) {
                toolCalls.push({
                  id: `call_${crypto.randomUUID().slice(0, 8)}`,
                  type: 'function',
                  function: {
                    name: part.functionCall.name,
                    arguments: JSON.stringify(part.functionCall.args || {}),
                  },
                });
              }
            }
          } catch {}
        }
      }

      const message: any = {
        role: 'assistant',
        content: contentText || null,
      };

      if (thoughtText.trim()) {
        message.reasoning_content = thoughtText.trim();
      }

      if (toolCalls.length > 0) {
        message.tool_calls = toolCalls;
      }

      return NextResponse.json(
        {
          id: `chatcmpl-${crypto.randomUUID().slice(0, 8)}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: modelId,
          choices: [
            {
              index: 0,
              message,
              finish_reason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (err: any) {
      attemptLogs.push({ account: account.name, status: 500, error: err.message || 'Execution error' });
    }
  }

  const lastErr = attemptLogs[attemptLogs.length - 1];
  return NextResponse.json(
    {
      error: {
        message: lastErr ? lastErr.error : 'All configured Google accounts failed or rate limited.',
        type: 'upstream_error',
        code: lastErr?.status || 500,
        attempts: attemptLogs,
      },
    },
    {
      status: lastErr?.status || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
