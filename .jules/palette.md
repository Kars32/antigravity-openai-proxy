# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-11-08 - Model Catalog Filtering & Micro-Interactions
**Learning:** In dense developer dashboards containing extensive grouped model catalogs (27+ entries across 7 categories), navigation fatigue occurs quickly without real-time filtering. Pairing an accessible search input (`aria-label`, clear action button, live match count badge `Showing X of Y models`) with an informative empty state containing a direct "Clear search" CTA preserves orientation and prevents dead-ends when querying specific model IDs or tiers (e.g. `claude`, `fast`, `deepseek`).
**Action:** When displaying grouped card collections or model catalogs, always provide immediate text filtering across primary identifiers (name, id, tier, description) accompanied by an inline match counter and zero-result recovery CTA.
