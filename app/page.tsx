'use client';

import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [apiKey, setApiKey] = useState('KARS-2010915');
  const [model, setModel] = useState('gemini-3.7-flash');
  const [prompt, setPrompt] = useState('Write a Python function to solve quicksort.');
  const [output, setOutput] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setOutput('');
    setThoughts('');

    try {
      const res = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setOutput(`Error: ${JSON.stringify(err, null, 2)}`);
        setLoading(false);
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
                setThoughts(prev => prev + delta.reasoning_content);
              }
              if (delta?.content) {
                setOutput(prev => prev + delta.content);
              }
            } catch {}
          }
        }
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid #27272a', paddingBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
            Antigravity OpenAI Proxy
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: 14, margin: '4px 0 0 0' }}>
            Universal, standard OpenAI-compatible API gateway routing Google Antigravity & Claude models
          </p>
        </div>
        <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, backgroundColor: '#18181b', border: '1px solid #27272a', color: '#a1a1aa' }}>
          v1.0.0
        </span>
      </div>

      <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#a1a1aa' }}>OpenAI / DeepSeek Client Configuration</h3>
        <pre style={{ backgroundColor: '#09090b', border: '1px solid #1f1f23', borderRadius: 8, padding: 16, fontSize: 13, color: '#e4e4e7', margin: 0, fontFamily: 'monospace' }}>
          <code>{`# Set Base URL and API Key in any OpenAI tool or DeepSeek harness:
export OPENAI_BASE_URL="https://YOUR-APP.vercel.app/v1"
export OPENAI_API_KEY="${apiKey}"`}</code>
        </pre>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>Test Request</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
            >
              <option value="gemini-3.7-flash">gemini-3.7-flash (Default Reasoning)</option>
              <option value="gemini-3.7-flash-thinking">gemini-3.7-flash-thinking (24k Thinking)</option>
              <option value="gemini-3.7-flash:fast">gemini-3.7-flash:fast (Zero-Thinking)</option>
              <option value="gemini-3.1-pro">gemini-3.1-pro (Deep Reasoning)</option>
              <option value="claude-sonnet-4-6">claude-sonnet-4-6 (Anthropic Flagship)</option>
              <option value="claude-opus-4-6-thinking">claude-opus-4-6-thinking (Anthropic Opus)</option>
              <option value="deepseek-reasoner">deepseek-reasoner (R1 Alias)</option>
              <option value="deepseek-chat">deepseek-chat (V3 Alias)</option>
              <option value="gpt-4o">gpt-4o (Universal Alias)</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>Prompt</label>
            <textarea
              rows={5}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6, padding: '10px 12px', color: '#f4f4f5', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#27272a' : '#ffffff',
              color: loading ? '#a1a1aa' : '#000000',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Streaming Response...' : 'Send Request'}
          </button>
        </div>

        <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>Response</h2>
          {thoughts && (
            <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: 6, fontSize: 12, color: '#a1a1aa', maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              <strong>Thinking:</strong> {thoughts}
            </div>
          )}
          <div style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #1f1f23', borderRadius: 8, padding: 16, overflowY: 'auto', minHeight: 200, fontSize: 13, color: '#f4f4f5', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {output || (loading ? 'Streaming...' : 'Output will appear here.')}
          </div>
        </div>
      </div>
    </div>
  );
}
