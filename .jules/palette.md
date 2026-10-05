# Palette's Journal - Critical Learnings Only

## 2026-10-04 - Accessible Form Controls & WAI-ARIA Tab Navigation Pattern
**Learning:** In single-page Next.js dashboard consoles built with inline dynamic states, icon-only buttons (e.g. copy snippets, lock gateway) and custom tab containers often lack accessible labels and ARIA attributes (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`). Screen readers cannot announce current active tab contexts or form field purposes.
**Action:** Always link form `<label>` elements explicitly to inputs via `htmlFor` and `id`, bind tab buttons to tab panels using WAI-ARIA properties, and provide explicit `aria-label` descriptors for copy and lock action buttons.
