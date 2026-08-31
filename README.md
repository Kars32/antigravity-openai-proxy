# Antigravity OpenAI Proxy Gateway

> High-Performance Universal OpenAI-Compatible API Gateway for Google Antigravity & Claude Models.  
> Designed for **Coding Agents, SWE-Bench, Evaluators, Tool Calling, and General-Purpose OpenAI Workflows**.

---

## ⚡ Features

1. **Universal OpenAI API Compatibility**: Standard `/v1/chat/completions` and `/v1/models` endpoints.
2. **Native Tool & Function Calling**: Bi-directional translation between OpenAI `tools` and Google CloudCode `functionDeclarations`.
3. **Pure Zero-Tampering Pass-Through**: 100% faithful prompt translation with zero roleplay rules or injected text.
4. **DeepSeek R1 Thinking Format**: Native `reasoning_content` delta streaming for benchmarks and agent harnesses.
5. **Model Catalog**: Native access to `gemini-3.7-flash`, `gemini-3.1-pro`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-4o`, `deepseek-reasoner`, `deepseek-chat`.
6. **Multi-Account Round-Robin**: Automatic load balancing with non-resetting 429 rate limit failover.

---

## 🚀 Quick Start

### 1. Configure Environment (`.env.local`)
```env
PROXY_API_KEY=KARS-2010915

ACCOUNT_1_NAME=yashv3050@gmail.com
ACCOUNT_1_REFRESH_TOKEN=1//...
ACCOUNT_1_PROJECT_ID=primeval-dreamer-xxspj

ACCOUNT_2_NAME=manishflamingopharma@gmail.com
ACCOUNT_2_REFRESH_TOKEN=1//...
ACCOUNT_2_PROJECT_ID=trusty-arch-pc9s2
```

### 2. Run Locally
```bash
npm install
npm run dev
```

---

## 📖 Client Setup

### OpenAI Python SDK
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://YOUR-APP.vercel.app/v1",
    api_key="KARS-2010915"
)

response = client.chat.completions.create(
    model="gemini-3.7-flash",
    messages=[{"role": "user", "content": "Write a binary search algorithm in Rust."}],
    stream=True
)

for chunk in response:
    delta = chunk.choices[0].delta
    if hasattr(delta, "reasoning_content") and delta.reasoning_content:
        print(delta.reasoning_content, end="", flush=True)
    if delta.content:
        print(delta.content, end="", flush=True)
```

### DeepSeek Harness / SWE-Bench
```bash
export OPENAI_BASE_URL="https://YOUR-APP.vercel.app/v1"
export OPENAI_API_KEY="KARS-2010915"

# Run evaluation:
python -m eval.run_bench --model deepseek-reasoner
```

---

## 📦 Deployment to Vercel
Deploy to Vercel with 1 click or via CLI:
```bash
vercel --prod
```
