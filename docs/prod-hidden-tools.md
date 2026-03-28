# Parked tools (product decision)

**Source:** Backlog **#48** (2026-03-28). These pages stay deployed; they are **not** in [`js/site.js`](../js/site.js) `NAV_GROUPS`, [`sitemap.xml`](../sitemap.xml), or the hub `ItemList`.

| Id | Outcome | Unhide when |
|----|---------|-------------|
| `csv-viewer` | Park | Nav + hub + sitemap + ItemList after table UX/size story matches public CSV tools; cross-links from CSV → JSON path reviewed. |
| `csv-cleaner` | Park | Positioning vs CSV Sorter stack clear in copy; same release checklist as other CSV tools (limits, errors). |
| `json-minifier` | Park | Either distinct from JSON Formatter “minify” in FAQ **or** folded into formatter so one nav entry suffices. |
| `csv-to-excel` | Park | Handoff from CSV / JSON tools smoke-tested; hub card + schema when added to `NAV_GROUPS`. |
| `json-to-excel` | Park | Same as `csv-to-excel`; JSON Viewer → Excel path verified. |

To **ship**: add the row back to `NAV_GROUPS` (correct group), run `npm run build`, refresh [`tools.md`](tools.md) tables, rebuild hub `ItemList`, add `loc` in `sitemap.xml`.
