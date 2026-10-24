# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-24 - Matching WAI-ARIA `aria-controls` with Tabpanel IDs
**Learning:** When adding `role="tab"` with `aria-controls="panel-<id>"`, every corresponding tabpanel must explicitly define `id="panel-<id>"` and `role="tabpanel"` so screen readers can properly navigate tab controls.
**Action:** Always verify that every `aria-controls` ID reference exists in the DOM alongside `role="tabpanel"`.
