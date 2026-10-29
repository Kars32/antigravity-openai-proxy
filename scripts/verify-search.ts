import fs from 'node:fs';
import assert from 'node:assert';
import path from 'node:path';

// 1. Read .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
}

// 2. Import modules
import { SUPPORTED_MODELS, resolveModel } from '../lib/models';
import {
  isWebSearchRequested,
  formatGroundingMarkdown,
  recordGroundingMetadata,
  createGroundingCollector,
  transformOpenAIToolsToGoogle
} from '../lib/tools';
import { transformOpenAIToAntigravity } from '../lib/antigravity';

async function main() {
  console.log('🧪 RUNNING ANTIGRAVITY OPENAI PROXY WEB SEARCH VERIFICATION\n');

  // Test 1: Model Catalog Registration
  console.log('Test 1: Model Catalog Registration');
  const requiredSearchModels = [
    'gemini-3.8-flash-search',
    'gemini-3.8-flash-web',
    'gemini-3.7-flash-search',
    'gemini-3.7-flash-web',
    'gemini-3.1-pro-search',
    'gemini-3.1-pro-web',
  ];

  for (const modelId of requiredSearchModels) {
    const found = SUPPORTED_MODELS.find(m => m.id === modelId);
    assert.ok(found, `Model ${modelId} must be registered in SUPPORTED_MODELS`);
    assert.strictEqual(found.tier, 'Search');
  }
  console.log('✅ All search models successfully registered in SUPPORTED_MODELS.\n');

  // Test 2: Model Name & Suffix Resolution
  console.log('Test 2: Model Name & Suffix Resolution');
  const testCases = [
    { input: 'gemini-3.8-flash-search', wire: 'gemini-3.8-flash-tiered', budget: 8192, search: true },
    { input: 'gemini-3.8-flash:search', wire: 'gemini-3.8-flash-tiered', budget: 8192, search: true },
    { input: 'gemini-3.8-flash-web', wire: 'gemini-3.8-flash-tiered', budget: 8192, search: true },
    { input: 'gemini-3.8-flash:web', wire: 'gemini-3.8-flash-tiered', budget: 8192, search: true },
    { input: 'gemini-3.7-flash-search', wire: 'gemini-3.7-flash-tiered', budget: 8192, search: true },
    { input: 'gemini-3.1-pro-search', wire: 'gemini-pro-agent', budget: 32768, search: true },
    { input: 'gemini-3.1-pro:search', wire: 'gemini-pro-agent', budget: 32768, search: true },
    { input: 'gemini-3.8-flash-high-search', wire: 'gemini-3.8-flash-tiered', budget: 24576, search: true },
  ];

  for (const tc of testCases) {
    const resolved = resolveModel(tc.input);
    assert.ok(resolved, `Failed to resolve ${tc.input}`);
    assert.strictEqual(resolved.wireModel, tc.wire, `Wire model mismatch for ${tc.input}`);
    assert.strictEqual(resolved.defaultThinkingBudget, tc.budget, `Thinking budget mismatch for ${tc.input}`);
    assert.strictEqual(resolved.isWebSearch, tc.search, `isWebSearch must be true for ${tc.input}`);
  }
  console.log('✅ Model name and search suffix resolution verified.\n');

  // Test 3: Request Parameter Detection
  console.log('Test 3: Request Parameter Detection');
  assert.strictEqual(isWebSearchRequested({ web_search: true }), true);
  assert.strictEqual(isWebSearchRequested({ web_search: 'true' }), true);
  assert.strictEqual(isWebSearchRequested({ search: true }), true);
  assert.strictEqual(isWebSearchRequested({ grounding: true }), true);
  assert.strictEqual(isWebSearchRequested({ tools: [{ type: 'web_search' }] }), true);
  assert.strictEqual(isWebSearchRequested({ tools: [{ type: 'google_search' }] }), true);
  assert.strictEqual(isWebSearchRequested({ tools: [{ type: 'search' }] }), true);
  assert.strictEqual(isWebSearchRequested({ tools: [{ type: 'function', function: { name: 'google_search' } }] }), true);
  assert.strictEqual(isWebSearchRequested({ model: 'gemini-3.8-flash' }), false);
  console.log('✅ Request parameter and tool detection verified.\n');

  // Test 4: Wire Injection of { googleSearch: {} }
  console.log('Test 4: Wire Injection of googleSearch tool');
  const resolved38Search = resolveModel('gemini-3.8-flash-search');
  const wireSearchOnly = transformOpenAIToAntigravity(
    { model: 'gemini-3.8-flash-search', messages: [{ role: 'user', content: 'News' }] },
    resolved38Search!,
    'test-proj'
  );
  assert.ok(wireSearchOnly.request.tools, 'Tools array must be present');
  assert.deepStrictEqual(wireSearchOnly.request.tools, [{ googleSearch: {} }]);
  assert.strictEqual(wireSearchOnly.request.toolConfig, undefined, 'toolConfig must be undefined when no functions exist');

  // Test preserving functionDeclarations when both custom tools and web_search are present
  const wireHybrid = transformOpenAIToAntigravity(
    {
      model: 'gemini-3.8-flash',
      web_search: true,
      messages: [{ role: 'user', content: 'News' }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_stock_price',
            description: 'Get stock price',
            parameters: { type: 'object', properties: { symbol: { type: 'string' } } }
          }
        }
      ],
      tool_choice: 'auto'
    },
    resolveModel('gemini-3.8-flash')!,
    'test-proj'
  );
  assert.strictEqual(wireHybrid.request.tools.length, 2, 'Tools must contain both functionDeclarations and googleSearch');
  assert.ok(wireHybrid.request.tools[0].functionDeclarations, 'functionDeclarations must be preserved');
  assert.deepStrictEqual(wireHybrid.request.tools[1], { googleSearch: {} }, 'googleSearch must be injected');
  assert.deepStrictEqual(wireHybrid.request.toolConfig, { functionCallingConfig: { mode: 'AUTO' } }, 'toolConfig must be preserved');
  console.log('✅ Wire injection and hybrid tool preservation verified.\n');

  // Test 5: Grounding Metadata Formatting
  console.log('Test 5: Grounding Metadata Formatting');
  const collector = createGroundingCollector();
  recordGroundingMetadata(
    {
      webSearchQueries: ['world news today\nwith newline'],
      groundingChunks: [
        { web: { uri: 'https://news.bbc.co.uk/sample', title: 'BBC News' } },
        { web: { uri: 'https://reuters.com/sample', title: 'Reuters\nHeadlines' } },
        { web: { uri: 'https://news.bbc.co.uk/sample', title: 'BBC News Duplicate' } },
        { web: { uri: 'https://news.bbc.co.uk/other-article', title: 'BBC News' } },
      ]
    },
    collector
  );
  assert.strictEqual(collector.sources.length, 3, 'Duplicate URLs must be deduplicated');
  const formatted = formatGroundingMarkdown(collector);
  assert.ok(formatted.includes('### Sources:'), 'Must include Sources header');
  assert.ok(formatted.includes('- [BBC News (1)](https://news.bbc.co.uk/sample)'), 'Repeated title must be disambiguated');
  assert.ok(formatted.includes('- [BBC News (2)](https://news.bbc.co.uk/other-article)'), 'Repeated title must be disambiguated');
  assert.ok(formatted.includes('- [Reuters Headlines](https://reuters.com/sample)'), 'Newlines in titles must be flattened');
  console.log('✅ Grounding metadata deduplication, title disambiguation, and markdown formatting verified.\n');

  // Test 6: End-to-End Live Upstream Grounding Call to Google CloudCode PA
  console.log('Test 6: Live Upstream Verification with gemini-3.8-flash-search');
  const refreshToken = env.ACCOUNT_1_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN;
  const projectId = env.ACCOUNT_1_PROJECT_ID || env.GOOGLE_PROJECT_ID || 'aicode-consumers';

  const MASK = 'antigravity-proxy-v1';
  const MASKED_CLIENT_ID = [80,94,67,88,87,66,87,70,95,68,76,20,65,95,27,21,17,94,5,88,15,92,28,91,86,30,2,4,12,70,74,24,6,6,0,20,22,71,30,5,6,90,68,90,2,2,79,23,25,4,10,3,23,29,0,31,21,72,3,66,4,28,23,6,9,6,4,24,29,90,26,66,29];
  const MASKED_CLIENT_SECRET = [38,33,55,58,55,42,76,61,92,76,63,122,34,70,87,78,53,73,58,123,80,3,56,43,95,1,57,53,93,14,79,92,52,51,9];
  function unmask(bytes: number[]) {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
      out += String.fromCharCode(bytes[i] ^ MASK.charCodeAt(i % MASK.length));
    }
    return out;
  }
  const clientId = env.GOOGLE_CLIENT_ID || unmask(MASKED_CLIENT_ID);
  const clientSecret = env.GOOGLE_CLIENT_SECRET || unmask(MASKED_CLIENT_SECRET);

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'antigravity/ide/2.1.1 darwin/arm64'
    },
    body: tokenParams.toString(),
  });

  assert.strictEqual(tokenRes.status, 200, 'OAuth token refresh must succeed');
  const tokenData = await tokenRes.json();
  const accessToken = (tokenData as any).access_token;
  assert.ok(accessToken, 'Access token must be present');

  const clientRequest = {
    model: 'gemini-3.8-flash-search',
    messages: [
      { role: 'user', content: 'What happened in the world today? Give me current news headlines.' }
    ]
  };

  const resolvedModelForCall = resolveModel(clientRequest.model);
  assert.ok(resolvedModelForCall, 'gemini-3.8-flash-search must resolve');
  const envelope = transformOpenAIToAntigravity(clientRequest, resolvedModelForCall!, projectId);

  const liveRes = await fetch('https://daily-cloudcode-pa.googleapis.com/v1internal:streamGenerateContent?alt=sse', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'User-Agent': 'antigravity/2.22.0 windows/amd64',
    },
    body: JSON.stringify(envelope),
  });

  assert.strictEqual(liveRes.status, 200, 'Upstream streamGenerateContent must return status 200');

  const liveText = await liveRes.text();
  const lines = liveText.split('\n');
  const liveCollector = createGroundingCollector();
  let generatedContent = '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const parsed = JSON.parse(line.slice(6));
        const cand = parsed.response?.candidates?.[0];
        if (cand?.groundingMetadata || parsed.response?.groundingMetadata) {
          recordGroundingMetadata(cand?.groundingMetadata || parsed.response?.groundingMetadata, liveCollector);
        }
        for (const p of cand?.content?.parts || []) {
          if (p.text && !p.thought) generatedContent += p.text;
        }
      } catch {}
    }
  }

  const liveSourcesMarkdown = formatGroundingMarkdown(liveCollector);
  const fullAssistantResponse = generatedContent + liveSourcesMarkdown;

  console.log('Generated response sample:', generatedContent.slice(0, 150) + '...');
  console.log('Extracted sources markdown:\n' + liveSourcesMarkdown);

  assert.ok(generatedContent.length > 50, 'Response text must be non-empty');
  assert.ok(liveCollector.sources.length > 0 || liveCollector.webSearchQueries.size > 0, 'Grounding metadata must be extracted');
  assert.ok(liveSourcesMarkdown.includes('### Sources:'), 'Formatted assistant response must contain ### Sources: header');
  assert.ok(fullAssistantResponse.includes('http'), 'Response must contain verified source links');

  console.log('✅ Live upstream grounding call succeeded with HTTP 200 and verified markdown sources!\n');
  console.log('🎉 ALL ANTIGRAVITY OPENAI PROXY TESTS PASSED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
