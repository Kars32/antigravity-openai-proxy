# Palette's Journal - Critical Learnings Only

This journal contains critical UX and accessibility learnings for `antigravity-openai-proxy`.
Only add entries for surprising accessibility issues, unexpected user behavior patterns, or reusable design system learnings.

## 2026-10-04 - Playground / Console Keyboard Ergonomics and Form Accessibility
**Learning:** In developer-facing interactive consoles with streaming response containers, multi-line prompt textareas often cause keyboard trap frustrations if users must tab through unrelated elements or switch to a mouse just to trigger an execution. Pairing prompt inputs with standard `Ctrl/Cmd+Enter` shortcuts and displaying a subtle `<kbd>` badge provides immediate discoverability and high typing efficiency. Furthermore, streaming AI response regions require `role="region"` with `aria-live="polite"` so screen reader users receive incremental completions without interrupting active narration.
**Action:** Always provide `Ctrl/Cmd+Enter` submission shortcuts, paired semantic `<kbd>` visual indicators, and polite live regions on multi-line developer prompt interfaces.
