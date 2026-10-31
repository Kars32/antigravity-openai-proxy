# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Form Labels and Tab Accessibility in Antigravity Gateway Dashboard
**Learning:** In custom inline-styled React dashboards, custom button tab navigations and standalone labels frequently lack programmatic associations (`role="tablist"` / `role="tab"` / `aria-selected` and `htmlFor` / `id` bindings). Without `htmlFor`/`id`, clicking a label doesn't focus or activate the corresponding input/textarea/select, reducing touch target usability and preventing screen readers from announcing form input names correctly.
**Action:** Always verify `htmlFor` and `id` pairings for form controls and ensure tab button groups provide proper ARIA tablist/tab semantics alongside accessible button descriptions for repetitive actions like "Copy model ID <model>".
