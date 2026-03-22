# Site improvement backlog

Tasks come from **scheduled audits** (`audit-results.md` has scores and narrative). Each item has an **ID** and **status** so you know what to implement next.

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

- [ ] **T-20260322-214952-1** `pending` — (csv-sorter/index.html) Add specific line-number reporting for CSV parse errors
- [ ] **T-20260322-214952-2** `pending` — (csv-sorter/index.html) Implement a 'Download as Excel' (XLSX) export option
- [ ] **T-20260322-214952-3** `pending` — (csv-sorter/index.html) Add a 'Preview' limit (truncate display for massive files to prevent browser hang)
- [ ] **T-20260322-214952-4** `pending` — (csv-sorter/index.html) Improve auto-detect logic for mixed-type columns
