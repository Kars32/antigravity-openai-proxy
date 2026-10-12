## 2025-05-20 - Streaming Response Live Regions & Dynamic Copy Labels

**Learning:** Single Page Application developer control centers with real-time SSE streaming responses require `aria-live="polite"` and `aria-busy` on output containers so assistive technologies announce new chunks as they stream without interrupting screen reader navigation. Furthermore, icon-only and compact copy buttons (`✓` / `Copy`) need dynamic `aria-label`s reflecting their success state to provide immediate feedback to screen reader users.

**Action:** Whenever building streaming UI panels or clipboard action buttons, always attach `aria-live="polite"` to the response box and dynamically update `aria-label` on action buttons when clipboard state changes.
