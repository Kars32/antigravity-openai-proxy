# Palette's Journal - Critical Learnings Only

This journal contains critical UX and accessibility insights for `antigravity-openai-proxy`.
Only add entries for surprising accessibility edge cases, codebase-specific component patterns, or critical UX ergonomics.

## 2026-10-04 - Playground Keyboard Ergonomics & Live Response Feedback
**Learning:** In developer-facing interactive testing playgrounds, prompting cycles are rapid and iterative. Requiring developers to switch from keyboard to mouse to click "Send Request" creates high interaction friction. Furthermore, during SSE streaming responses, dynamic updates in the response output area are not announced to screen readers unless the region is explicitly marked with `aria-live="polite"`. Once output arrives, developers frequently copy raw model text to test payloads or share outputs; omitting a direct copy button causes tedious manual drag-selects in preformatted monospace boxes.
**Action:** Always provide `Ctrl+Enter` / `Cmd+Enter` handlers on prompt textareas alongside subtle visual hints, attach `htmlFor` / `id` attributes to every form label, wrap streaming output targets in `aria-live="polite"`, and provide a 1-click copy button with distinct copied feedback.
