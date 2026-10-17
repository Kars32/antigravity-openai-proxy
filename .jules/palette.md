# Palette's Journal - Critical Learnings

## 2025-05-15 - Dashboard Navigation Tab WAI-ARIA Accessibility
**Learning:** React tab interfaces implemented using plain `<button>`s without `role="tablist"`, `role="tab"`, and `role="tabpanel"` attributes hinder screen reader users from understanding tab relationships and active panel selections.
**Action:** Always wrap tab button containers in `role="tablist"` with `aria-label`, attach `role="tab"`, `aria-selected`, `aria-controls`, and `id` to each tab button, and wrap active tab content in a `role="tabpanel"` linked via `aria-labelledby`.
