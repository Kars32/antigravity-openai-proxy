# Antigravity OpenAI Proxy — Project Summary & Architecture Runbook

> **Universal High-Performance OpenAI API Gateway for Google Antigravity & Claude Models**  
> *Project Path*: `c:\Users\yashv\antigravity-proxies\antigravity-openai-proxy`  
> *GitHub Repository*: [https://github.com/Kars32/antigravity-openai-proxy](https://github.com/Kars32/antigravity-openai-proxy) (Account: `Kars32`)  
> *Live Gateway URL*: [https://antigravity-openai-proxy.vercel.app](https://antigravity-openai-proxy.vercel.app)  
> *Active OpenAI Base URL*: `https://antigravity-openai-proxy.vercel.app/v1`  
> *Master Access Key*: `KARS-2010915`  

---

## 1. Executive Summary & Purpose

`antigravity-openai-proxy` is a lightweight, zero-tampering, high-concurrency serverless gateway deployed on Vercel. It translates standard **OpenAI API protocol requests** (`/v1/chat/completions` and `/v1/models`) into **Google Antigravity's internal CloudCode PA wire protocol** (`daily-cloudcode-pa.googleapis.com` / `cloudcode-pa.googleapis.com`).

Key Capabilities:
* **Coding Agents, SWE-Bench & Evaluators** (DeepSeek Harness, Cline, OpenClaw, Continue, Aider).
* **Native Tool & Function Calling** (bi-directional parameter and schema translation).
* **DeepSeek R1 Thinking Format** (streams internal reasoning tokens inside `choices[0].delta.reasoning_content`).
* **Pure Zero-Tampering Pass-Through** (0 system prompts added, 0 user injections, 0 persona anchors).

---

## 2. Explicit Native Model Catalog & Thinking Tiers

All models are exposed with explicit standalone IDs for high, medium, low, and fast tiers:

| Model ID | Name | Tier | Speed | Thinking Budget | Context Window | Internal Wire Model |
|---|---|---|---|---|---|---|
| `gemini-3.7-flash-high` | Gemini 3.7 Flash | **High** | Fast | 24,576 Tokens | 1,048,576 | `gemini-3.7-flash-tiered` |
| `gemini-3.7-flash-medium` | Gemini 3.7 Flash | **Medium (Mid)** | Fast | 8,192 Tokens | 1,048,576 | `gemini-3.7-flash-tiered` |
| `gemini-3.7-flash-low` | Gemini 3.7 Flash | **Low** | Fast | 2,048 Tokens | 1,048,576 | `gemini-3.7-flash-tiered` |
| `gemini-3.7-flash-fast` | Gemini 3.7 Flash | **Fast (Off)** | Ultra-Fast | 0 Tokens | 1,048,576 | `gemini-3.7-flash-tiered` |
| `gemini-3.6-flash-high` | Gemini 3.6 Flash | **High** | Fast | 16,384 Tokens | 1,048,576 | `gemini-3.6-flash-high` |
| `gemini-3.6-flash-medium` | Gemini 3.6 Flash | **Medium (Mid)** | Fast | 8,192 Tokens | 1,048,576 | `gemini-3.6-flash-medium` |
| `gemini-3.6-flash-low` | Gemini 3.6 Flash | **Low** | Fast | 2,048 Tokens | 1,048,576 | `gemini-3.6-flash-low` |
| `gemini-3.1-pro` | Gemini 3.1 Pro | **Agent** | Deep | 32,768 Tokens | 1,048,576 | `gemini-pro-agent` |
| `gemini-3.1-pro-low` | Gemini 3.1 Pro | **Low** | Medium | 4,096 Tokens | 1,048,576 | `gemini-3.1-pro-low` |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | **Thinking** | Adaptive | 16,384 Tokens | 1,048,576 | `claude-sonnet-4-6` |
| `claude-opus-4-6-thinking`| Claude Opus 4.6 | **Thinking** | Deep | 16,384 Tokens | 1,048,576 | `claude-opus-4-6-thinking` |
| `gpt-oss-120b-medium` | GPT-OSS 120B | **Medium** | Fast | 8,192 Tokens | 1,048,576 | `gpt-oss-120b-medium` |

---

## 3. Core Engine Architecture

### A. Authentication & Lock Screen (`app/page.tsx`)
* **Obsidian Lock Screen Gate**: Unauthorized visitors are presented with a minimalist dark gate.
* **Auto-Login via URL**: Visiting `https://antigravity-openai-proxy.vercel.app/?key=KARS-2010915` validates the key with `/api/status`, stores it in `localStorage`, and scrubs the URL param.
* **Top-Bar Lock Button**: Allows 1-click logout.

### B. Request Handling & Translation (`lib/completions.ts`)
* **Streaming SSE**: Standard `data: { ... }\n\n` and `data: [DONE]\n\n` stream with reasoning tokens mapped to `delta.reasoning_content`.
* **Non-Streaming**: Aggregates all parts into a standard OpenAI `chat.completion` JSON object.
* **Tool Calling**: Converts Google's `functionCall` into standard OpenAI `tool_calls` arrays with JSON arguments.

### C. Antigravity CloudCode PA Protocol (`lib/antigravity.ts`)
* **OAuth Token Refresh**: Automatically exchanges Google OAuth refresh tokens for short-lived access tokens with in-memory caching.
* **Multi-Account Round-Robin**: Evenly balances generation turns across configured Google accounts.
* **Non-Resetting 429 Cooldown**: If an account hits Google's 429 or 503 capacity limit, it enters a 20-second cooldown window. If all accounts are cooling down, the proxy immediately returns 429 with Indian Standard Time (IST) countdown diagnostics instead of hammering Google.
* **Safety Filters**: All 5 harm categories explicitly set to `BLOCK_NONE`.
* **Turn Boundary Validation**: Guarantees the prompt starts and ends on a `user` turn and alternates roles.

### D. Tool / Function Translation Engine (`lib/tools.ts`)
* Converts OpenAI `tools` format into Google `functionDeclarations` format.
* Translates `tool_choice` options (`auto`, `none`, `required`, or specific functions).

---

## 4. Environment Configuration

Add the following environment variables in Vercel or `.env.local`:

```env
# Master Proxy API Key
PROXY_API_KEY=KARS-2010915

# Google Account 1 (yashv3050@gmail.com)
ACCOUNT_1_NAME=yashv3050@gmail.com
ACCOUNT_1_REFRESH_TOKEN=1//<your-google-oauth-refresh-token>
ACCOUNT_1_PROJECT_ID=primeval-dreamer-xxspj

# Google Account 2 (manishflamingopharma@gmail.com)
ACCOUNT_2_NAME=manishflamingopharma@gmail.com
ACCOUNT_2_REFRESH_TOKEN=1//<your-second-refresh-token>
ACCOUNT_2_PROJECT_ID=trusty-arch-pc9s2

# Google Client Credentials
GOOGLE_CLIENT_ID=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

---

## 5. Quick Usage Examples

### Python (OpenAI SDK)
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://antigravity-openai-proxy.vercel.app/v1",
    api_key="KARS-2010915"
)

response = client.chat.completions.create(
    model="gemini-3.7-flash-high",  # or "gemini-3.7-flash-medium", "gemini-3.6-flash-high", "claude-sonnet-4-6"
    messages=[{"role": "user", "content": "Write a binary search in Rust"}],
    stream=True
)

for chunk in response:
    delta = chunk.choices[0].delta
    if hasattr(delta, "reasoning_content") and delta.reasoning_content:
        print(delta.reasoning_content, end="", flush=True)
    if delta.content:
        print(delta.content, end="", flush=True)
```

### cURL
```bash
curl -X POST "https://antigravity-openai-proxy.vercel.app/v1/chat/completions" \
  -H "Authorization: Bearer KARS-2010915" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.7-flash-high",
    "messages": [{"role": "user", "content": "Explain quicksort."}],
    "stream": true
  }'
```

---

## 6. Project Directory Map

```
antigravity-openai-proxy/
├── app/
│   ├── api/
│   │   ├── chat/completions/route.ts   # Route alias
│   │   ├── models/route.ts             # Route alias
│   │   ├── status/route.ts             # Health & account cooldown telemetry
│   │   └── v1/
│   │       ├── chat/completions/route.ts
│   │       └── models/route.ts
│   ├── chat/completions/route.ts       # Route alias
│   ├── models/route.ts                 # Route alias
│   ├── v1/
│   │   ├── chat/completions/route.ts   # Primary OpenAI chat route
│   │   └── models/route.ts             # Primary OpenAI models route
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Developer Dashboard with lock screen
├── lib/
│   ├── antigravity.ts                  # Google CloudCode PA OAuth & wire transform
│   ├── completions.ts                  # OpenAI SSE streaming & completion handler
│   ├── models.ts                       # Pure Antigravity model specifications & resolver
│   └── tools.ts                        # Bi-directional OpenAI <-> Google tool translator
├── next.config.js                      # Next.js config with CORS headers
├── package.json
├── PROJECT_SUMMARY.md                  # This architecture document
└── README.md                           # Public GitHub documentation
```
