# Palette's Journal - Critical Learnings Only

This journal records critical UX/accessibility learnings and patterns for `antigravity-openai-proxy`.

## 2026-10-04 - Accessible Tab Navigation in Obsidian Control Center
**Learning:** Custom tab lists rendered with raw `<button>` elements in dark/obsidian UI themes can present accessibility issues for screen readers if ARIA roles (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`) and explicit `aria-label` attributes for icon/snippet action buttons are missing.
**Action:** Always wrap custom dashboard tab headers in `role="tablist"` with descriptive `aria-label`s, set `role="tab"` and `aria-selected` on individual tab triggers, and link `aria-controls` to corresponding `role="tabpanel"` containers.
