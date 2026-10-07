# Bolt's Journal - Critical Learnings Only

This journal contains critical architectural insights and non-obvious performance learnings for `antigravity-openai-proxy`.
Only add entries for surprising failures, codebase-specific anti-patterns, or critical architectural lessons.

## 2026-10-04 - Google CloudCode Multi-Turn Wire Protocol Transformation
**Learning:** Google CloudCode PA wire protocol requires turn alternation (`user -> model -> user`) and merging of consecutive same-role messages. An anti-pattern was decomposing this into 3 separate sequential loops: Pass 1 scanning for system messages, Pass 2 building intermediate `{ role, parts }` objects into a `rawContents` array, and Pass 3 re-scanning `rawContents` while shallow-copying `[...turn.parts]` into `merged`. In long-context roleplay sessions (50–100+ turns), this created hundreds of unnecessary intermediate array/object allocations and increased garbage collection overhead right before dispatching upstream HTTP requests.
**Action:** Always process message role conversion and consecutive-turn merging as a single-pass streaming reducer (`appendTurn`) directly into the final `merged` array, collecting system blocks during the same traversal.

## 2026-10-04 - Google Protobuf Struct Schema & Tool Response Serialization
**Learning:** When streaming tool calls and responses, OpenAI clients frequently emit primitives (e.g. booleans like `true`, numbers like `42`, or arrays) as tool response contents, and omit the `name` field in favor of `tool_call_id`. Google CloudCode PA's protobuf schema requires `functionResponse.response` to strictly be a `google.protobuf.Struct` (a JSON dictionary/object) and requires `functionResponse.name` to match the original tool call name. Passing bare primitives or default dummy names results in upstream HTTP 400 schema validation errors.
**Action:** During single-pass transformation, index `tool_calls` by ID to resolve function names dynamically, and defensively wrap non-object/array tool payloads in `{ response: payload }` before wire transmission.

## 2026-10-04 - Concurrent Cold-Start OAuth Thundering Herd
**Learning:** Under high-concurrency traffic or container cold-starts, multiple concurrent requests finding an expired access token simultaneously dispatched duplicate OAuth token exchange requests to `oauth2.googleapis.com` and `loadCodeAssistMetadata`. This increased proxy latency by 300ms–800ms and risked Google OAuth rate limits.
**Action:** Implement single-flight promise memoization on `getAccessToken` via an in-flight Promise map, ensuring all concurrent requests share a single refresh promise and resolve immediately once it settles.

## 2026-10-04 - Static Route Data Precomputation & Bounded Model Resolution Memoization
**Learning:** Re-mapping `SUPPORTED_MODELS` with `OPENCODE_MODELS.some(...)` on every `GET /v1/models` request performed $O(N \times M)$ nested array scans and object allocations per request for static catalog data. Additionally, unbounded `Map` memoization for user-supplied request parameters (e.g. `modelId`) introduces memory exhaustion risks.
**Action:** Pre-compute static model catalog lists using an $O(1)$ `Set` lookup for ownership at module load time, and bound model resolution memoization maps to a strict maximum size (e.g., `MAX_CACHE_SIZE = 256`) to guarantee $O(1)$ resolution speed while remaining safe against memory exhaustion DoS attacks.
