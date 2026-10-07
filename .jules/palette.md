## 2025-10-07 - Accessible Form Controls in Custom Inline React UI
**Learning:** In custom inline-styled React dashboards, inputs and select controls missing `id` and `htmlFor` prevent screen readers and clicking on labels from focusing controls. Additionally, dynamic error messages need `role="alert"` and `aria-describedby` links.
**Action:** Always link form labels to control IDs and connect validation error elements with `aria-describedby` and `role="alert"`.
