## 2025-05-18 - Accessibility for Custom Pure Inline-Styled Control Panels
**Learning:** Custom UI controls (tabs, copy buttons, forms with inline CSS styles) in Next.js SPAs lack screen reader accessibility out-of-the-box unless `htmlFor`/`id` labels, `role="tablist"`/`tabpanel` markup, and an `aria-live="polite"` region for clipboard announcements are explicitly added.
**Action:** When building or auditing custom inline-styled dashboard components, always verify `htmlFor` label bindings, ARIA tab roles, and aria-live announcements for async/clipboard actions.
