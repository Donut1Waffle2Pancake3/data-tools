# Site improvement backlog

Tasks can be **manual** or left over from **past audits** (`audit-results.md` has older scores and narrative). Each item has an **ID** and **status** so you know what to implement next.

## Status reference

| Status | Meaning |
|--------|---------|
| `pending` | New from audit; not triaged yet |
| `ready` | Approved — safe to implement |
| `in_progress` | Work in flight |
| `blocked` | Waiting on something else |
| `wontfix` | Decided not to do |

When you **finish** a task, move it from **To do** to **Completed** and set checkbox `[x]` and status to `done`.

---

## Completed

<!-- Example (move real items here when done):
- [x] **T-20250322-000000-1** `done` — (csv-sorter/index.html) Short description of what was fixed
-->

---

## To do

<!-- Audits append new lines below. Format:
- [ ] **T-YYYYMMDD-HHMMSS-n** `pending` — (path) Task title
-->



- [ ] **T-20260322-220112-1** `pending` — (csv-sorter/index.html) Implement specific error messaging for malformed CSV parsing
- [ ] **T-20260322-220112-2** `pending` — (csv-sorter/index.html) Add support for multi-column sorting (secondary/tertiary keys)
- [ ] **T-20260322-220112-3** `pending` — (csv-sorter/index.html) Add a 'Download as Excel' (XLSX) export option using a library like SheetJS
- [ ] **T-20260322-220112-4** `pending` — (csv-sorter/index.html) Add keyboard support for navigating the result preview textarea
- [ ] **T-20260322-215017-1** `pending` — (csv-sorter/index.html) Add multi-column sorting support
- [ ] **T-20260322-215017-2** `pending` — (csv-sorter/index.html) Implement content-based CSV validation before parsing
- [ ] **T-20260322-215017-3** `pending` — (csv-sorter/index.html) Add support for custom date formats (e.g., DD/MM/YYYY)
- [ ] **T-20260322-215017-4** `pending` — (csv-sorter/index.html) Add 'Export to JSON' feature as an alternative output format
- [ ] **T-20260322-215017-5** `pending` — (csv-sorter/index.html) Improve mobile responsiveness for the result preview textarea
- [ ] **T-20260322-214952-1** `pending` — (csv-sorter/index.html) Add specific line-number reporting for CSV parse errors
- [ ] **T-20260322-214952-2** `pending` — (csv-sorter/index.html) Implement a 'Download as Excel' (XLSX) export option
- [ ] **T-20260322-214952-3** `pending` — (csv-sorter/index.html) Add a 'Preview' limit (truncate display for massive files to prevent browser hang)
- [ ] **T-20260322-214952-4** `pending` — (csv-sorter/index.html) Improve auto-detect logic for mixed-type columns
