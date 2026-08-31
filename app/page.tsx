'use client';

import React, { useState, useEffect, useRef } from 'react';

const DOMAIN = 'https://antigravity-openai-proxy.vercel.app';

export default function AntigravityOpenAIControlCenter() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginKeyInput, setLoginKeyInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<'quickstart' | 'models' | 'test' | 'accounts'>('quickstart');
  const [codeTab, setCodeTab] = useState<'python' | 'curl' | 'harness' | 'node'>('python');

  // Gateway Status & Telemetry
  const [status, setStatus] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Playground / Test Console State
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [testPrompt, setTestPrompt] = useState('Write a Python function to solve quicksort with clean type hints.');
  const [testOutput, setTestOutput] = useState('');
  const [testThoughts, setTestThoughts] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Auth Initialization on Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlKey = urlParams.get('key') || urlParams.get('auth');
      const storedKey = localStorage.getItem('proxy_master_key') || '';

      const keyToTest = urlKey || storedKey;
      if (keyToTest) {
        verifyAndUnlock(keyToTest, !!urlKey);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  // 1-second live countdown ticker for account cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      setAccounts(prev => {
        if (!prev || prev.length === 0) return prev;
        let changed = false;
        const next = prev.map(acc => {
          if (acc.cooldownRemainingSec && acc.cooldownRemainingSec > 0) {
            changed = true;
            const remaining = acc.cooldownRemainingSec - 1;
            return {
              ...acc,
              cooldownRemainingSec: Math.max(0, remaining),
              isCoolingDown: remaining > 0,
            };
          }
          return acc;
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const verifyAndUnlock = async (key: string, clearUrlParam = false) => {
    setIsVerifying(true);
    setLoginError('');
    const trimmed = key.trim();

    try {
      const start = Date.now();
      const res = await fetch('/api/status', {
        headers: { 'Authorization': `Bearer ${trimmed}` }
      });

      if (res.ok) {
        const data = await res.json();
        setApiKey(trimmed);
        localStorage.setItem('proxy_master_key', trimmed);
        setIsAuthenticated(true);
        setStatus(data);
        setAccounts(data.accounts || []);
        setLatencyMs(Date.now() - start);

        if (clearUrlParam && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setLoginError('Invalid Master Key. Access Denied.');
        setIsAuthenticated(false);
      }
    } catch {
      setLoginError('Unable to connect to gateway.');
      setIsAuthenticated(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('proxy_master_key');
    setApiKey('');
    setIsAuthenticated(false);
    setStatus(null);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendTest = async () => {
    setIsTesting(true);
    setTestOutput('');
    setTestThoughts('');
    const start = performance.now();

    try {
      const res = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: testPrompt }],
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setTestOutput(`Error (${res.status}): ${JSON.stringify(err, null, 2)}`);
        setIsTesting(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.reasoning_content) {
                setTestThoughts(prev => prev + delta.reasoning_content);
              }
              if (delta?.content) {
                setTestOutput(prev => prev + delta.content);
              }
            } catch {}
          }
        }
      }
      setTestLatency(Math.round(performance.now() - start));
    } catch (e: any) {
      setTestOutput(`Connection Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // 1. Initial Loading State
  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', color: '#a1a1aa', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e', margin: '0 auto 12px auto', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Authenticating Gateway...</div>
        </div>
      </div>
    );
  }

  // 2. Obsidian Lock Screen Gate
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 16, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, backgroundColor: '#18181b', border: '1px solid #27272a', marginBottom: 16 }}>
              🔒
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Antigravity OpenAI Proxy</h1>
            <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0 }}>Enter your master API key to access developer console</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); verifyAndUnlock(loginKeyInput); }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6 }}>Master Proxy Key</label>
              <input
                type="password"
                placeholder="KARS-..."
                value={loginKeyInput}
                onChange={(e) => setLoginKeyInput(e.target.value)}
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '10px 14px', color: '#f4f4f5', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                autoFocus
              />
            </div>

            {loginError && (
              <div style={{ fontSize: 12, color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !loginKeyInput.trim()}
              style={{
                width: '100%',
                backgroundColor: isVerifying || !loginKeyInput.trim() ? '#27272a' : '#ffffff',
                color: isVerifying || !loginKeyInput.trim() ? '#71717a' : '#000000',
                border: 'none',
                borderRadius: 8,
                padding: '11px',
                fontSize: 14,
                fontWeight: 600,
                cursor: isVerifying || !loginKeyInput.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isVerifying ? 'Verifying Key...' : 'Unlock Gateway →'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1f1f23', textAlign: 'center', fontSize: 12, color: '#71717a' }}>
            Endpoint: <code style={{ color: '#a1a1aa' }}>{DOMAIN}/v1</code>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Developer Control Center
  const pythonCode = `from openai import OpenAI

client = OpenAI(
    base_url="${DOMAIN}/v1",
    api_key="${apiKey}"
)

response = client.chat.completions.create(
    model="gemini-3.7-flash",
    messages=[{"role": "user", "content": "Write a binary search function in Python"}],
    stream=True
)

for chunk in response:
    delta = chunk.choices[0].delta
    # Access thinking tokens
    if hasattr(delta, "reasoning_content") and delta.reasoning_content:
        print(delta.reasoning_content, end="", flush=True)
    if delta.content:
        print(delta.content, end="", flush=True)`;

  const curlCode = `curl -X POST "${DOMAIN}/v1/chat/completions" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-3.7-flash",
    "messages": [{"role": "user", "content": "Explain quicksort."}],
    "stream": true
  }'`;

  const harnessCode = `# DeepSeek Harness / SWE-Bench / Evaluators
export OPENAI_BASE_URL="${DOMAIN}/v1"
export OPENAI_API_KEY="${apiKey}"

# Run evaluation:
python -m eval.run_bench --model deepseek-reasoner`;

  const nodeCode = `import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: '${DOMAIN}/v1',
  apiKey: '${apiKey}',
});

const stream = await openai.chat.completions.create({
  model: 'gemini-3.7-flash',
  messages: [{ role: 'user', content: 'Hello world' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}`;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', minHeight: '100vh', color: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid #27272a', paddingBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></span>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Antigravity OpenAI Proxy</h1>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, backgroundColor: '#18181b', border: '1px solid #27272a', color: '#a1a1aa' }}>
              Live Vercel Gateway
            </span>
          </div>
          <p style={{ color: '#a1a1aa', fontSize: 13, margin: '4px 0 0 0' }}>
            Universal, zero-tampering OpenAI-compatible API gateway routing Google Antigravity & Claude models
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {latencyMs !== null && (
            <span style={{ fontSize: 12, color: '#71717a' }}>
              Ping: <strong style={{ color: '#22c55e' }}>{latencyMs}ms</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#a1a1aa', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
          >
            🔒 Lock Gateway
          </button>
        </div>
      </div>

      {/* Gateway Endpoint Header Card */}
      <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 20, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Active OpenAI Base URL
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: '#38bdf8' }}>
            {DOMAIN}/v1
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => copyToClipboard(`${DOMAIN}/v1`, 'base_url')}
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#f4f4f5', padding: '8px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            {copiedField === 'base_url' ? '✓ Copied Base URL' : '📋 Copy Base URL'}
          </button>
          <button
            onClick={() => copyToClipboard(apiKey, 'key')}
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#f4f4f5', padding: '8px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            {copiedField === 'key' ? '✓ Copied API Key' : '🔑 Copy API Key'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #1f1f23', paddingBottom: 12 }}>
        {[
          { id: 'quickstart', label: '⚡ Quickstart & Setup' },
          { id: 'models', label: '🧠 Models Catalog' },
          { id: 'test', label: '🔬 Interactive Test Console' },
          { id: 'accounts', label: '📊 Account Pool Health' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              backgroundColor: activeTab === tab.id ? '#27272a' : 'transparent',
              border: 'none',
              color: activeTab === tab.id ? '#ffffff' : '#a1a1aa',
              padding: '8px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Quickstart Code Snippets */}
      {activeTab === 'quickstart' && (
        <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'python', label: 'Python SDK' },
                { id: 'curl', label: 'cURL' },
                { id: 'harness', label: 'DeepSeek Harness / SWE-Bench' },
                { id: 'node', label: 'Node.js / TS' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setCodeTab(st.id as any)}
                  style={{
                    backgroundColor: codeTab === st.id ? '#27272a' : 'transparent',
                    border: 'none',
                    color: codeTab === st.id ? '#fff' : '#a1a1aa',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const code = codeTab === 'python' ? pythonCode : codeTab === 'curl' ? curlCode : codeTab === 'harness' ? harnessCode : nodeCode;
                copyToClipboard(code, 'code');
              }}
              style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#a1a1aa', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}
            >
              {copiedField === 'code' ? '✓ Copied' : 'Copy Snippet'}
            </button>
          </div>

          <pre style={{ backgroundColor: '#09090b', border: '1px solid #1f1f23', borderRadius: 8, padding: 18, fontSize: 13, color: '#e4e4e7', margin: 0, fontFamily: 'monospace', overflowX: 'auto' }}>
            <code>{codeTab === 'python' ? pythonCode : codeTab === 'curl' ? curlCode : codeTab === 'harness' ? harnessCode : nodeCode}</code>
          </pre>
        </div>
      )}

      {/* TAB 2: Models Catalog */}
      {activeTab === 'models' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {[
            { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'Hybrid reasoning and fast multimodal flagship.', thinking: '8,192 Tokens', tier: 'Flagship' },
            { id: 'gemini-3.7-flash-thinking', name: 'Gemini 3.7 Flash (Extended)', desc: 'Maximum thinking token budget for complex math & SWE.', thinking: '24,576 Tokens', tier: 'Reasoning' },
            { id: 'gemini-3.7-flash:fast', name: 'Gemini 3.7 Flash (Fast)', desc: 'Zero-thinking ultra-low latency generation for tools.', thinking: '0 Tokens', tier: 'Fast' },
            { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', desc: 'Google agentic model for deep code repository analysis.', thinking: '32,768 Tokens', tier: 'Pro' },
            { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', desc: 'High-performance Anthropic model for software engineering.', thinking: '16,384 Tokens', tier: 'Anthropic' },
            { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6', desc: 'Anthropic flagship deep reasoning and creative engine.', thinking: '16,384 Tokens', tier: 'Anthropic' },
            { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (Alias)', desc: 'DeepSeek R1 reasoning alias routed to Gemini 3.7 High.', thinking: '24,576 Tokens', tier: 'Alias' },
            { id: 'deepseek-chat', name: 'DeepSeek Chat (Alias)', desc: 'DeepSeek V3 fast chat alias routed to Gemini 3.7 Fast.', thinking: '0 Tokens', tier: 'Alias' },
            { id: 'gpt-4o', name: 'GPT-4o (Alias)', desc: 'Universal OpenAI alias routed to Gemini 3.7 Flash.', thinking: '8,192 Tokens', tier: 'Alias' },
          ].map(m => (
            <div key={m.id} style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: '#18181b', border: '1px solid #27272a', color: '#a1a1aa' }}>
                  {m.tier}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#a1a1aa', margin: '0 0 12px 0' }}>{m.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #1f1f23' }}>
                <code style={{ fontSize: 12, color: '#38bdf8' }}>{m.id}</code>
                <button
                  onClick={() => copyToClipboard(m.id, m.id)}
                  style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#f4f4f5', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                >
                  {copiedField === m.id ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Interactive Testing Console */}
      {activeTab === 'test' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>Send Completion Request</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Default Reasoning)</option>
                <option value="gemini-3.7-flash-thinking">gemini-3.7-flash-thinking (Extended Thinking)</option>
                <option value="gemini-3.7-flash:fast">gemini-3.7-flash:fast (Zero-Latency Fast)</option>
                <option value="gemini-3.1-pro">gemini-3.1-pro (Deep Reasoning)</option>
                <option value="claude-sonnet-4-6">claude-sonnet-4-6 (Anthropic)</option>
                <option value="claude-opus-4-6-thinking">claude-opus-4-6-thinking (Opus)</option>
                <option value="deepseek-reasoner">deepseek-reasoner (R1 Alias)</option>
                <option value="deepseek-chat">deepseek-chat (V3 Alias)</option>
                <option value="gpt-4o">gpt-4o (Universal Alias)</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>Prompt</label>
              <textarea
                rows={6}
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6, padding: '10px 12px', color: '#f4f4f5', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleSendTest}
              disabled={isTesting}
              style={{
                width: '100%',
                backgroundColor: isTesting ? '#27272a' : '#ffffff',
                color: isTesting ? '#a1a1aa' : '#000000',
                border: 'none',
                borderRadius: 6,
                padding: '11px',
                fontSize: 14,
                fontWeight: 600,
                cursor: isTesting ? 'not-allowed' : 'pointer',
              }}
            >
              {isTesting ? 'Streaming Response...' : 'Send Request →'}
            </button>
          </div>

          <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Model Response</h2>
              {testLatency && <span style={{ fontSize: 12, color: '#22c55e' }}>{testLatency}ms</span>}
            </div>

            {testThoughts && (
              <div style={{ marginBottom: 14, border: '1px solid #3f3f46', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#18181b', padding: '6px 12px', fontSize: 11, color: '#a1a1aa', fontWeight: 600 }}>
                  🧠 Reasoning Tokens (reasoning_content)
                </div>
                <div style={{ padding: 12, maxHeight: 140, overflowY: 'auto', fontSize: 12, color: '#d4d4d8', backgroundColor: '#09090b', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {testThoughts}
                </div>
              </div>
            )}

            <div style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #1f1f23', borderRadius: 8, padding: 16, overflowY: 'auto', minHeight: 200, fontSize: 13, color: '#f4f4f5', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {testOutput || (isTesting ? 'Waiting for model stream...' : 'Response output will stream here.')}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Account Pool Health */}
      {activeTab === 'accounts' && (
        <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>Google Account Pool & Rate Limit Failover</h2>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '0 0 20px 0' }}>
            Generation requests are automatically distributed 50/50 across active Google OAuth accounts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{acc.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, backgroundColor: acc.isCoolingDown ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: acc.isCoolingDown ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {acc.isCoolingDown ? `Cooldown (${acc.cooldownRemainingSec}s)` : '● Ready'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#71717a' }}>GCP Project ID: <code style={{ color: '#a1a1aa' }}>{acc.projectId}</code></div>
                <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>Failures: {acc.failCount || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
