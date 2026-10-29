## 2025-10-29 - ARIA Labels on Dynamic State Buttons
**Learning:** Overriding button text content with static `aria-label` values prevents screen readers from announcing dynamic text state changes (e.g. "✓ Copied").
**Action:** When updating button states dynamically (e.g., copied status), ensure `aria-label` is also dynamically updated or rely on `aria-live="polite"` with dynamic label string interpolation.
