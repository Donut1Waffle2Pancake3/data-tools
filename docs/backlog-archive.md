# Backlog archive

Shipped or **closed** items (newest at the bottom). Moved from [`backlog.md`](backlog.md). Keep the same **#** as in the backlog so history stays traceable.

Use the same sections as open tickets (**Source**, **In plain English**, **Action**, **Acceptance**), plus **Status:** Completed (or Closed / Wontfix) and **Delivered:** (what actually shipped, files/links).

---

## 1. JSON Tools — Large file freeze prevention

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** JSON viewer and validator loaded unbounded JSON on the main thread; marketing copy claimed a non-existent virtualized tree.
- **Why it mattered:** Risk of tab freeze and misleading SEO/FAQ trust.

**Action:** Enforce a **10 MB** UTF-8 cap on paste, file read, and drop-zone paths for `json-viewer` and `json-validator`; align FAQ + JSON-LD; optional `maxFileBytes` on shared `initDropZone`.

**Acceptance:** Large inputs show a clear error instead of freezing; inaccurate virtualization claim removed.

**Delivered:** [`json-viewer/index.html`](../json-viewer/index.html) (size guard, `FileReader` `onerror`, hint + FAQ + schema), [`json-validator/script.js`](../json-validator/script.js) + [`json-validator/index.html`](../json-validator/index.html) (guard + drop hint + FAQ), [`js/site.js`](../js/site.js) (`initDropZone` `maxFileBytes`). Follow-up: backlog **#22**.

---

## 2. CSV Tools — Memory & loading guardrails

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** CSV Viewer and Cleaner loaded uploads with no size limits, no reading overlay, and no paste guardrails vs CSV Sorter.
- **Why it mattered:** Risk of tab freeze and no feedback while large files read from disk.

**Action:** Match sorter policy: **50 MB** soft warning, **200 MB** hard reject; **Loading file…** overlay on drop zone during `readFileAsText`; paste/validate same byte limits on viewer preview and cleaner run.

**Acceptance:** Busy state during file read; oversize rejected with clear copy; warnings for large-but-allowed input.

**Delivered:** [`csv-viewer/index.html`](../csv-viewer/index.html), [`csv-cleaner/index.html`](../csv-cleaner/index.html) (shared constants, `readFileAsText`, drop validation, warning + error regions, hint copy).

---

## 3. Text Tools — Debounce live inputs

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** Regex tester and text case converter ran a full match/case pass on every `input` event, so large pastes could freeze the main thread.
- **Why it mattered:** Responsiveness during fast typing and paste.

**Action:** **280 ms** debounce on textarea `input` for both tools; immediate `render()` for initial paint, Clear, and regex flag toggles; cancel pending timer when clearing or changing flags.

**Acceptance:** Heavy logic runs after a short pause in typing, not on every key.

**Delivered:** [`regex-tester/index.html`](../regex-tester/index.html), [`text-case-converter/index.html`](../text-case-converter/index.html).

---

## 5. CSV Tools — Strict malformed CSV errors

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** Unclosed quoted fields could yield a wrong grid or generic parse errors in the viewer; cleaner had the same blind spot.
- **Why it mattered:** Trust and correct interpretation of broken exports.

**Action:** After parsing, if `inQuotes` is still true, throw the same message as `csv-sorter`. Viewer `catch` surfaces `err.message` when present.

**Acceptance:** Specific “quoted field was never closed” copy instead of silent wrong rows or only a generic fallback.

**Delivered:** [`csv-viewer/index.html`](../csv-viewer/index.html), [`csv-cleaner/index.html`](../csv-cleaner/index.html).

---

## 6. JSON Tools — Transparent parse errors

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** Invalid JSON in the viewer showed only a generic message; JSON-to-CSV could auto-repair truncated JSON with no visible notice.
- **Why it mattered:** Users could misdiagnose syntax issues or export CSV from silently “fixed” incomplete JSON.

**Action:** Surface `SyntaxError.message` in `json-viewer` when present; show a warning in `json-to-csv` when `parseJsonWithRecovery` used auto-repair; improve `SyntaxError` copy on failed convert.

**Acceptance:** Viewer shows specific parse errors; converter shows a visible warning if recovery was used.

**Delivered:** [`json-viewer/index.html`](../json-viewer/index.html), [`json-to-csv/index.html`](../json-to-csv/index.html).

---

<!--
## N. Short title

**Status:** Completed
**Source:** …

### In plain English

- **What it was:** …
- **Why it mattered:** …

**Action:** …

**Acceptance:** …

**Delivered:** Paths, PR, or one-line summary of what shipped.

-->
