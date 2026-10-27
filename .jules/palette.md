# Palette's Journal - Critical UX Learnings

## 2025-05-18 - Dynamic ARIA Labels on Stateful Buttons
**Learning:** Overriding `aria-label` with a static string on buttons with state changes (e.g. "Copy" -> "Copied") prevents screen readers from announcing state changes because `aria-label` completely takes precedence over child text.
**Action:** Always compute `aria-label` dynamically based on state when visual confirmation text changes on actionable controls.
