# Palette Journal - Critical UX/A11y Learnings

## 2025-05-15 - Form Labeling & ARIA Tab Accessibility in Control Center Dashboard
**Learning:** Single-page dashboard interfaces with custom tab switches and inline form controls require explicit `htmlFor`/`id` bindings and proper ARIA `role="tablist"` / `role="tab"` roles so screen readers can properly navigate control panels and communicate active states.
**Action:** Always bind labels with `htmlFor` and `id`, apply ARIA roles for tabbed navigation, and ensure dynamic streaming elements use `aria-live="polite"`.
