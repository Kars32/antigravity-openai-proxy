import assert from 'node:assert';
import { transformOpenAIToAntigravity, parseDataUri } from './lib/antigravity';

console.log('--- Testing transformOpenAIToAntigravity from lib/antigravity ---');

// Test 1: Simple user turn
const res1 = transformOpenAIToAntigravity(
  { messages: [{ role: 'user', content: 'Hello' }] },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res1.project, 'test-proj');
assert.strictEqual(res1.model, 'gemini-3.8-flash-tiered');
assert.strictEqual(res1.request.contents.length, 1);
assert.strictEqual(res1.request.contents[0].role, 'user');
assert.strictEqual(res1.request.contents[0].parts[0].text, 'Hello');
console.log('✓ Test 1: Simple user turn passed');

// Test 2: System prompt extraction and merging
const res2 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'system', content: 'You are an expert.' },
      { role: 'system', content: 'Follow safety guidelines.' },
      { role: 'user', content: 'Hello' },
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res2.request.systemInstruction.parts[0].text, 'You are an expert.\n\nFollow safety guidelines.');
assert.strictEqual(res2.request.contents.length, 1);
assert.strictEqual(res2.request.contents[0].role, 'user');
console.log('✓ Test 2: System prompt extraction passed');

// Test 3: Same-role consecutive turns merging
const res3 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'user', content: 'Part A' },
      { role: 'user', content: 'Part B' },
      { role: 'assistant', content: 'Resp 1' },
      { role: 'assistant', content: 'Resp 2' },
      { role: 'user', content: 'Follow up' },
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res3.request.contents.length, 3);
assert.strictEqual(res3.request.contents[0].role, 'user');
assert.strictEqual(res3.request.contents[0].parts.length, 2);
assert.strictEqual(res3.request.contents[0].parts[0].text, 'Part A');
assert.strictEqual(res3.request.contents[0].parts[1].text, 'Part B');
assert.strictEqual(res3.request.contents[1].role, 'model');
assert.strictEqual(res3.request.contents[1].parts.length, 2);
assert.strictEqual(res3.request.contents[2].role, 'user');
console.log('✓ Test 3: Consecutive turn merging passed');

// Test 4: Boundary conditions (starts with model, ends with model)
const res4 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'assistant', content: 'Hi' },
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res4.request.contents[0].role, 'user');
assert.strictEqual(res4.request.contents[0].parts[0].text, 'Hello.');
assert.strictEqual(res4.request.contents[1].role, 'model');
assert.strictEqual(res4.request.contents[2].role, 'user');
assert.strictEqual(res4.request.contents[2].parts[0].text, 'Continue.');
console.log('✓ Test 4: Boundary auto-padding passed');

// Test 5: Tool calls and tool responses
const res5 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'user', content: 'Run tool' },
      {
        role: 'assistant',
        content: 'Running...',
        tool_calls: [{ id: 'call_1', function: { name: 'calc', arguments: '{"x":1}' } }]
      },
      { role: 'tool', name: 'calc', content: '{"result":2}' }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res5.request.contents.length, 3);
assert.strictEqual(res5.request.contents[1].role, 'model');
assert.strictEqual(res5.request.contents[1].parts[0].text, 'Running...');
assert.strictEqual(res5.request.contents[1].parts[1].functionCall.name, 'calc');
assert.strictEqual(res5.request.contents[2].role, 'user');
assert.strictEqual(res5.request.contents[2].parts[0].functionResponse.name, 'calc');
assert.deepStrictEqual(res5.request.contents[2].parts[0].functionResponse.response, { result: 2 });
console.log('✓ Test 5: Tool calls and responses passed');

// Test 6: Protobuf Struct wrapping for scalar tool responses (boolean, number, array, null)
const res6 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'user', content: 'Run checks' },
      {
        role: 'assistant',
        tool_calls: [
          { id: 'c_bool', function: { name: 'is_ready', arguments: '{}' } },
          { id: 'c_num', function: { name: 'get_count', arguments: '{}' } },
          { id: 'c_arr', function: { name: 'get_list', arguments: '{}' } },
        ]
      },
      { role: 'tool', tool_call_id: 'c_bool', content: 'true' },
      { role: 'tool', tool_call_id: 'c_num', content: '100' },
      { role: 'tool', tool_call_id: 'c_arr', content: '["item1", "item2"]' },
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res6.request.contents.length, 3);
const toolParts = res6.request.contents[2].parts;
assert.strictEqual(toolParts.length, 3);
assert.deepStrictEqual(toolParts[0].functionResponse, { name: 'is_ready', response: { response: true }, id: 'c_bool' });
assert.deepStrictEqual(toolParts[1].functionResponse, { name: 'get_count', response: { response: 100 }, id: 'c_num' });
assert.deepStrictEqual(toolParts[2].functionResponse, { name: 'get_list', response: { response: ['item1', 'item2'] }, id: 'c_arr' });
console.log('✓ Test 6: Protobuf Struct wrapping for scalar tool responses passed');

// Test 7: Function name resolution from tool_call_id when name is omitted
const res7 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'user', content: 'Lookup weather' },
      {
        role: 'assistant',
        tool_calls: [{ id: 'call_weather_99', function: { name: 'get_weather', arguments: '{"city":"Tokyo"}' } }]
      },
      { role: 'tool', tool_call_id: 'call_weather_99', content: '{"temperature": 18}' }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res7.request.contents[2].parts[0].functionResponse.name, 'get_weather');
assert.deepStrictEqual(res7.request.contents[2].parts[0].functionResponse.response, { temperature: 18 });
console.log('✓ Test 7: Function name resolution from tool_call_id passed');

// Test 8: Legacy function_call preserves assistant message content text
const res8 = transformOpenAIToAntigravity(
  {
    messages: [
      { role: 'user', content: 'Execute legacy' },
      {
        role: 'assistant',
        content: 'Executing command now...',
        function_call: { name: 'do_legacy', arguments: '{"cmd":"run"}' }
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res8.request.contents[1].parts.length, 2);
assert.strictEqual(res8.request.contents[1].parts[0].text, 'Executing command now...');
assert.strictEqual(res8.request.contents[1].parts[1].functionCall.name, 'do_legacy');
console.log('✓ Test 8: Legacy function_call content preservation passed');

// Test 9: Array content with mixed strings and text objects
const res9 = transformOpenAIToAntigravity(
  {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          'world',
          { type: 'text', text: 'from test' }
        ]
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res9.request.contents[0].parts[0].text, 'Hello\nworld\nfrom test');
console.log('✓ Test 9: Mixed array content extraction passed');

// Test 10: Multimodal image data URI transformation
const sample1x1Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// 10.1 parseDataUri helper tests
const parsedPng = parseDataUri(sample1x1Png);
assert.ok(parsedPng, 'parseDataUri should parse 1x1 png data URI');
assert.strictEqual(parsedPng?.mimeType, 'image/png');
assert.strictEqual(parsedPng?.data, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
assert.strictEqual(parseDataUri('https://example.com/test.png'), null, 'Non-data URI should return null');
assert.strictEqual(parseDataUri('data:invalid'), null, 'Invalid data URI should return null');

// 10.2 Multimodal user message with text and image
const res10Multimodal = transformOpenAIToAntigravity(
  {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this picture?' },
          { type: 'image_url', image_url: { url: sample1x1Png } }
        ]
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res10Multimodal.request.contents.length, 1);
assert.strictEqual(res10Multimodal.request.contents[0].role, 'user');
assert.strictEqual(res10Multimodal.request.contents[0].parts.length, 2);
assert.strictEqual(res10Multimodal.request.contents[0].parts[0].text, 'What is in this picture?');
assert.deepStrictEqual(res10Multimodal.request.contents[0].parts[1].inlineData, {
  mimeType: 'image/png',
  data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
});
assert.strictEqual((res10Multimodal.request.contents[0].parts[1] as any).inline_data, undefined, 'Must omit inline_data to avoid protobuf oneof collision');

// 10.3 Standalone image part (no text)
const res10ImageOnly = transformOpenAIToAntigravity(
  {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: sample1x1Png } }
        ]
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res10ImageOnly.request.contents.length, 1);
assert.strictEqual(res10ImageOnly.request.contents[0].role, 'user');
assert.strictEqual(res10ImageOnly.request.contents[0].parts.length, 1);
assert.strictEqual(res10ImageOnly.request.contents[0].parts[0].inlineData.mimeType, 'image/png');

// 10.4 String format image_url fallback
const res10StringUrl = transformOpenAIToAntigravity(
  {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: sample1x1Png as any }
        ]
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res10StringUrl.request.contents[0].parts[0].inlineData.mimeType, 'image/png');

// 10.5 parseDataUri edge cases: uppercase, whitespace, RFC 2397 params, interior newlines, invalid empty
const parsedUpper = parseDataUri('  DATA:IMAGE/JPEG;BASE64,iVBORw0KGgo=  ');
assert.strictEqual(parsedUpper?.mimeType, 'image/jpeg');
assert.strictEqual(parsedUpper?.data, 'iVBORw0KGgo=');

const parsedParams = parseDataUri('data:image/png;name=photo.png;charset=utf-8;base64,iVBORw0KGgo=');
assert.strictEqual(parsedParams?.mimeType, 'image/png');
assert.strictEqual(parsedParams?.data, 'iVBORw0KGgo=');

const parsedNewlines = parseDataUri('data:image/png;base64,iVBO\r\nRw0K\nGgo=');
assert.strictEqual(parsedNewlines?.data, 'iVBORw0KGgo=');

assert.strictEqual(parseDataUri('data:image/png;base64,'), null, 'Empty base64 data must return null');
assert.strictEqual(parseDataUri(null as any), null, 'Null must return null');

// 10.6 Flat url and Anthropic image format support
const res10FlatUrl = transformOpenAIToAntigravity(
  {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', url: sample1x1Png } as any
        ]
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res10FlatUrl.request.contents[0].parts[0].inlineData.mimeType, 'image/png');

const res10Anthropic = transformOpenAIToAntigravity(
  {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'abc\ndef\r\n' } } as any
        ]
      }
    ]
  },
  { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
  'test-proj'
);
assert.strictEqual(res10Anthropic.request.contents[0].parts[0].inlineData.mimeType, 'image/jpeg');
assert.strictEqual(res10Anthropic.request.contents[0].parts[0].inlineData.data, 'abcdef');

console.log('✓ Test 10: Multimodal image data URI transformation passed');

// Test 11: Single-flight OAuth token deduplication
async function runAsyncTests() {
  const { getAccessToken } = await import('./lib/antigravity');
  const originalFetch = global.fetch;
  let fetchCount = 0;
  global.fetch = (async (url: any) => {
    fetchCount++;
    await new Promise(r => setTimeout(r, 20));
    return {
      ok: true,
      json: async () => ({ access_token: 'test_dedup_token', expires_in: 3600 })
    } as any;
  }) as any;

  try {
    const testAccount = {
      id: 'acc_test_singleflight',
      name: 'SingleFlight Test',
      refreshToken: 'fake_refresh_token',
      projectId: 'fake_project',
      accessToken: null,
      expiresAt: 0,
      cooldownUntil: 0,
      failCount: 0
    };

    const [t1, t2, t3] = await Promise.all([
      getAccessToken(testAccount),
      getAccessToken(testAccount),
      getAccessToken(testAccount)
    ]);

    assert.strictEqual(t1, 'test_dedup_token');
    assert.strictEqual(t2, 'test_dedup_token');
    assert.strictEqual(t3, 'test_dedup_token');
    assert.strictEqual(fetchCount, 1, 'Concurrent getAccessToken calls must share a single network fetch');
    console.log('✓ Test 11: Single-flight OAuth token deduplication passed (3 concurrent calls -> 1 fetch)');
  } finally {
    global.fetch = originalFetch;
  }

  // Test 12: Desktop Antigravity IDE Authentic Headers Cloaking
  const { ANTIGRAVITY_USER_AGENT, ANTIGRAVITY_API_CLIENT, getAntigravityHeaders, deriveDeterministicSessionId, BANNED_ACCOUNTS, isBannedAccount } = await import('./lib/antigravity');
  assert.strictEqual(ANTIGRAVITY_USER_AGENT, 'antigravity/2.22.0 windows/amd64', 'User-Agent must match authentic IDE');
  assert.strictEqual(ANTIGRAVITY_API_CLIENT, 'gl-node/20.18.0 gccl/2.22.0', 'API Client must match authentic gl-node client');
  const headers = getAntigravityHeaders('mock_token_123', 'text/event-stream');
  assert.strictEqual(headers['User-Agent'], 'antigravity/2.22.0 windows/amd64');
  assert.strictEqual(headers['X-Goog-Api-Client'], 'gl-node/20.18.0 gccl/2.22.0');
  assert.strictEqual(headers['Authorization'], 'Bearer mock_token_123');
  assert.strictEqual(headers['Accept'], 'text/event-stream');
  console.log('✓ Test 12: Desktop Antigravity IDE Telemetry Cloaking headers passed');

  // Test 13: Deterministic conversation-anchored sessionId derivation across multi-turn conversation
  const turn1Messages = [
    { role: 'user', content: 'Write a TypeScript function to calculate Fibonacci' }
  ];
  const turn2Messages = [
    { role: 'user', content: 'Write a TypeScript function to calculate Fibonacci' },
    { role: 'assistant', content: 'function fib(n: number)...' },
    { role: 'user', content: 'Now optimize it with memoization' }
  ];
  const wireTurn1 = transformOpenAIToAntigravity({ messages: turn1Messages }, { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 }, 'test-proj');
  const wireTurn2 = transformOpenAIToAntigravity({ messages: turn2Messages }, { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 }, 'test-proj');

  assert.ok(/^-\d+$/.test(wireTurn1.request.sessionId), 'Turn 1 sessionId must be negative numeric string');
  assert.ok(/^-\d+$/.test(wireTurn2.request.sessionId), 'Turn 2 sessionId must be negative numeric string');
  assert.strictEqual(wireTurn1.request.sessionId, wireTurn2.request.sessionId, 'Consecutive turns in same conversation MUST have identical sessionId');
  assert.ok(/^agent\/\d+\/[0-9a-f]{8}$/.test(wireTurn1.requestId), 'Envelope requestId must match authentic agent/<timestamp>/<uuid8>');
  console.log('✓ Test 13: Stable conversation-anchored sessionId across turns passed');

  // Test 14: Custom session ID and edge case fallback
  const customWire1 = transformOpenAIToAntigravity(
    { messages: turn1Messages },
    { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
    'test-proj',
    { sessionId: 'session-xyz-987' }
  );
  const customWire2 = transformOpenAIToAntigravity(
    { messages: turn2Messages },
    { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
    'test-proj',
    { sessionId: 'session-xyz-987' }
  );
  assert.ok(/^-\d+$/.test(customWire1.request.sessionId), 'Custom sessionId must format to negative numeric string');
  assert.strictEqual(customWire1.request.sessionId, customWire2.request.sessionId, 'Same custom session ID produces identical wire sessionId');

  // Whitespace-only custom sessionId must safely fall through to conversation-anchored user message
  const whitespaceSessionWire = transformOpenAIToAntigravity(
    { messages: turn1Messages },
    { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
    'test-proj',
    { sessionId: '   ' }
  );
  assert.strictEqual(whitespaceSessionWire.request.sessionId, wireTurn1.request.sessionId, 'Whitespace-only sessionId must fall through to conversation-anchored seed');
  console.log('✓ Test 14: Custom session ID and whitespace edge-case fallback passed');

  // Test 15: Safe project isolation fallback
  const fallbackWire = transformOpenAIToAntigravity(
    { messages: turn1Messages },
    { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 },
    ''
  );
  assert.strictEqual(fallbackWire.project, 'aicode-consumers', 'Empty projectId must safely fallback to aicode-consumers without cross-account contamination');
  console.log('✓ Test 15: Safe project isolation fallback passed');

  // Test 16: Banned accounts filter & robust pattern recognition
  assert.ok(isBannedAccount('kars86120@gmail.com'), 'kars86120@gmail.com must be identified as banned');
  assert.ok(isBannedAccount('kars86120'), 'kars86120 must be identified as banned');
  assert.ok(isBannedAccount('KARS86120@GMAIL.COM'), 'Case-insensitive banned check must succeed');
  assert.ok(isBannedAccount('kars86120 (Account 3)'), 'Substring match with label must be identified as banned');
  assert.ok(isBannedAccount('kars86120@googlemail.com'), 'Variant domain must be identified as banned');
  assert.strictEqual(isBannedAccount('yashv3050@gmail.com'), false, 'Legitimate account must not be flagged');
  assert.strictEqual(isBannedAccount('Account 1'), false, 'Generic account label must not be flagged');
  console.log('✓ Test 16: Banned accounts filter & pattern recognition passed');

  // Test 17: Precomputed OPENAI_MODELS_LIST integrity and ownership correctness
  const { OPENAI_MODELS_LIST, SUPPORTED_MODELS } = await import('./lib/models');
  const { OPENCODE_MODELS } = await import('./lib/opencode');
  const opencodeSet = new Set(OPENCODE_MODELS.map(m => m.id));

  assert.strictEqual(OPENAI_MODELS_LIST.length, SUPPORTED_MODELS.length, 'OPENAI_MODELS_LIST length must match SUPPORTED_MODELS length');
  assert.ok(Object.isFrozen(OPENAI_MODELS_LIST), 'OPENAI_MODELS_LIST must be frozen against mutations');

  for (let i = 0; i < SUPPORTED_MODELS.length; i++) {
    const raw = SUPPORTED_MODELS[i];
    const item = OPENAI_MODELS_LIST[i];
    assert.strictEqual(item.id, raw.id);
    assert.strictEqual(item.object, 'model');
    assert.strictEqual(item.created, 1700000000);
    assert.strictEqual(item.root, raw.wireModel);
    assert.strictEqual(item.parent, null);
    assert.deepStrictEqual(item.permission, []);
    const expectedOwner = opencodeSet.has(raw.id) ? 'opencode' : 'google-antigravity';
    assert.strictEqual(item.owned_by, expectedOwner, `owned_by mismatch for ${raw.id}`);
  }
  console.log('✓ Test 17: Precomputed OPENAI_MODELS_LIST schema and ownership integrity passed');

  console.log('\nAll 17 test suites passed successfully!');
}

runAsyncTests().catch(err => {
  console.error('Async tests failed:', err);
  process.exit(1);
});
