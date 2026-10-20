## 2025-05-18 - Explicit Label Associations and Dynamic Alert Roles in Dark Theme Dashboards
**Learning:** In single-page dark dashboards with inline styling, form controls (`<input>`, `<select>`, `<textarea>`) frequently lack explicit `id` and `htmlFor` connections to their labels, and status/error notifications omit `role="alert"` and `aria-live="polite"`.
**Action:** Always link labels to inputs with `htmlFor` and `id`, aria-describe inputs with dynamic error message IDs, and give alert containers `role="alert"` and `aria-live="polite"`.
