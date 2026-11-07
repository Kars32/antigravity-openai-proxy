# Palette's Journal - Critical Learnings Only

## 2025-05-14 - Dashboard ARIA Tab Semantics and Dynamic Copy Live Regions
**Learning:** In inline-styled Next.js dashboard consoles without component libraries, button groups acting as tabs and copy buttons frequently lack semantic roles (`role="tablist"`, `role="tab"`, `role="tabpanel"`) and screen reader notifications. Visual-only status changes like swapping "Copy" for a checkmark leave screen reader users unaware that content was copied to their clipboard.
**Action:** When adding copy actions or custom tab bars, pair visual state changes with descriptive dynamic `aria-label`s and a lightweight visually-hidden `role="status"` `aria-live="polite"` announcement container, and link inputs to labels using explicit `htmlFor`/`id` bindings.
