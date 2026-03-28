The next time you see this message, rewrite this page to be as concise as possible while preserving meaning.  Then delete this message.

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

## 7. Regex Tester — Limit warnings & ReDoS protection

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** The tool capped matches at 50k with no explanation, and regex ran on the main thread so pathological patterns could freeze the UI.
- **Why it mattered:** Users could trust incomplete results or lose control of the tab while editing.

**Action:** Visible warning when the 50k iteration cap truncates results; run matching in a dedicated **Web Worker** with main-thread fallback if workers are unavailable.

**Acceptance:** Truncation is obvious in the UI; regex evaluation does not block the main UI in supporting browsers.

**Delivered:** [`regex-tester/index.html`](../regex-tester/index.html), [`regex-tester/regex-worker.js`](../regex-tester/regex-worker.js). Follow-up: backlog **#25**.

---

## 4. CSV Cleaner — Add custom delimiter support

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** The cleaner only split on commas, so tab- and semicolon-separated files parsed incorrectly.
- **Why it mattered:** European CSV and TSV exports failed or produced garbage columns.

**Action:** Delimiter UI aligned with `csv-sorter` (auto-detect, comma, tab, semicolon, pipe, custom); RFC-style parse with multi-char delimiters; output delimiter select (comma default, same as input, tab, semicolon, pipe); FAQ + meta/schema touch-up.

**Acceptance:** Tab- and semicolon-separated input cleans correctly; user can emit comma CSV or preserve separator.

**Delivered:** [`csv-cleaner/index.html`](../csv-cleaner/index.html). Follow-up: backlog **#26**.

---

## 11. Text Case Converter & Diff — DOM scale constraints

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** Case converter embedded up to four full copies of huge text in the DOM; diff built one table row per change with no upper bound.
- **Why it mattered:** Large pastes could freeze layout or exhaust memory.

**Action:** Case tool: keep full conversions in memory; cap each on-screen preview (~12k chars); scrollable preview panels; Copy uses full strings. Diff: cap rendered rows (4k) with banner + truncated copy note; global add/remove/change counts still from full diff.

**Acceptance:** Very large inputs avoid massive DOM duplication; diff UI stays bounded with explicit truncation messaging.

**Delivered:** [`text-case-converter/index.html`](../text-case-converter/index.html), [`text-diff/index.html`](../text-diff/index.html). Follow-up: backlog **#27**.

---

## 8. CSV / JSON Tools — Excel export integration

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** After sorting, cleaning, or viewing CSV—or viewing JSON—users had to hunt for the Excel converters and re-paste data.
- **Why it mattered:** Excel is a common next step; friction dropped completion rates.

**Action:** `TinyDataToolExcelHandoff` in [`js/site.js`](../js/site.js) stores CSV/JSON in `sessionStorage` for one-shot handoff; **CSV → Excel** and **JSON → Excel** pages consume it on load. **Open in CSV → Excel** / **Open in JSON → Excel** actions on `csv-sorter`, `csv-cleaner`, `csv-viewer`, `json-to-csv`, and `json-viewer`.

**Acceptance:** One click from those tools lands on the right converter with the current output pre-filled (when storage allows).

**Delivered:** [`js/site.js`](../js/site.js), [`csv-to-excel/index.html`](../csv-to-excel/index.html), [`json-to-excel/index.html`](../json-to-excel/index.html), [`csv-sorter/index.html`](../csv-sorter/index.html), [`csv-cleaner/index.html`](../csv-cleaner/index.html), [`csv-viewer/index.html`](../csv-viewer/index.html), [`json-to-csv/index.html`](../json-to-csv/index.html), [`json-viewer/index.html`](../json-viewer/index.html).

---

## 9. All Tools — Robust clipboard fallback & icon state

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** Copy failed without the Clipboard API; success handlers often replaced button content with plain text and removed SVG icons.
- **Why it mattered:** Copy is core UX; broken or ugly copy states erode trust.

**Action:** Central `TinyDataToolClipboard` in [`js/site.js`](../js/site.js) with `execCommand('copy')` fallback and `flashCopySuccess` that preserves icons; migrate tool pages and JSON Validator copy-error control.

**Acceptance:** Copy works in more environments; icons stay intact where applicable.

**Delivered:** [`js/site.js`](../js/site.js) (`TinyDataToolClipboard`, optional `flashOpts` on `copyWithFeedback`), tool `index.html` pages (CSV/JSON/text/encoder tools + template reference), [`json-validator/script.js`](../json-validator/script.js). Removed unused global `copyWithFeedback` helper that only used `navigator.clipboard`.

---

## 10. JSON Viewer — Mobile action wrapping

**Status:** Completed  
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it was:** Copy / Download / Excel action buttons stayed on one row and could overflow on narrow viewports.
- **Why it mattered:** Core actions were hard to reach on phones.

**Action:** Allow `.output-actions` to wrap; tune button flex so rows wrap cleanly.

**Acceptance:** Buttons stack on narrow widths without horizontal overflow.

**Delivered:** [`json-viewer/index.html`](../json-viewer/index.html) (`.output-actions` `flex-wrap: wrap`; `.output-actions .btn-download` `flex: 1 1 auto` + `min-width: min(100%, 140px)`; `.path-bar__text` `min-width: 0` + `flex: 1 1 auto` so path ellipsis works in the flex row on narrow widths).

---

## 19. New tool — Text → URL slug generator

**Status:** Completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it was:** No dedicated slug utility; high-intent “slug from title” queries were uncaptured.
- **Why it mattered:** Fast SEO and UX win next to case, trim, and URL tools.

**Action:** New `slug-generator/` page with live preview, separator and cleanup options, default + custom stop words, bulk mode, copy.

**Acceptance:** Predictable slugs; linked from nav, All Tools, homepage text grid, and related tools on case/trim/URL pages.

**Delivered:** [`slug-generator/index.html`](../slug-generator/index.html), [`js/site.js`](../js/site.js) (`NAV_GROUPS`, `RELATED_TOOL_OVERRIDES`), [`tools/index.html`](../tools/index.html) (grid + ItemList), [`index.html`](../index.html) (homepage card), [`docs/tools.md`](../tools.md), [`sitemap.xml`](../sitemap.xml) (new URL).

---

## 29. SEO — `sitemap.xml` lists every public tool URL (parity with nav)

**Status:** Completed  
**Source:** Gap found while shipping #19 (2026-03-28)

### In plain English

- **What it was:** `sitemap.xml` listed only part of the site; many live tools were missing from crawl hints.
- **Why it mattered:** Weaker discovery for indexed pages and drift every time a tool shipped.

**Action:** Align [`sitemap.xml`](../sitemap.xml) with [`js/site.js`](../js/site.js) `NAV_GROUPS` and `PRODUCTION_HIDDEN_TOOL_IDS`.

**Acceptance:** Every public (non-hidden) tool has a `<loc>`; home and `/tools/` retained; policy noted in-file.

**Delivered:** [`sitemap.xml`](../sitemap.xml) — full public set (all non-hidden tool paths + `/` + `/tools/`), top XML comment documents sync rule with `PRODUCTION_HIDDEN_TOOL_IDS`.

---

## 20. New tool — UUID generator / validator

**Status:** Completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it was:** No in-product UUID helper for bulk IDs or pasted list validation.
- **Why it mattered:** High dev intent, low build cost, complements JSON tooling.

**Action:** `uuid-generator/` with v4 generation (`randomUUID` + `getRandomValues` fallback), bulk cap 10k with chunked generation, multi-line validator (RFC-style, nil UUID, braces / `urn:` / quotes).

**Acceptance:** Copy integration, nav + All Tools + homepage + sitemap + related links from formatter, regex tester, JSON viewer.

**Delivered:** [`uuid-generator/index.html`](../uuid-generator/index.html), [`js/site.js`](../js/site.js), [`tools/index.html`](../tools/index.html), [`index.html`](../index.html), [`docs/tools.md`](../tools.md), [`sitemap.xml`](../sitemap.xml).

---

## 21. New tool — Unix timestamp ↔ human datetime

**Status:** Completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it was:** No dedicated epoch / ISO conversion tool for logs and JSON workflows.
- **Why it mattered:** High search volume and natural fit next to JSON utilities.

**Action:** `unix-timestamp-converter/` with IANA zone select (incl. local), s/ms modes, ISO ↔ epoch, batch (500 lines, auto-detect s vs ms), **Now** on epoch and human (ISO) flows, DST called out in UI.

**Acceptance:** Linked from nav, All Tools, homepage, sitemap; related tools on `json-viewer`, `uuid-generator`, `json-formatter`.

**Delivered:** [`unix-timestamp-converter/index.html`](../unix-timestamp-converter/index.html), [`js/site.js`](../js/site.js), [`tools/index.html`](../tools/index.html), [`index.html`](../index.html), [`docs/tools.md`](../tools.md), [`sitemap.xml`](../sitemap.xml).

---

## 28. Excel handoff — user-visible message when sessionStorage prefill fails (quota)

**Status:** Completed  
**Source:** Gap after #8 (2026-03-28)

### In plain English

- **What it was:** “Open in … Excel” always navigated even when `sessionStorage.setItem` failed, so the converter opened empty with no explanation.
- **Why it mattered:** Large handoffs looked like a broken product.

**Action:** Before navigation, require `TinyDataToolExcelHandoff.stash*` to return true; on false or missing API, show an inline error and stay on the tool.

**Acceptance:** Failed stash never silently sends users to an empty Excel page.

**Delivered:** [`csv-sorter/index.html`](../csv-sorter/index.html), [`csv-viewer/index.html`](../csv-viewer/index.html), [`csv-cleaner/index.html`](../csv-cleaner/index.html), [`json-to-csv/index.html`](../json-to-csv/index.html), [`json-viewer/index.html`](../json-viewer/index.html).

---

## 24. Other CSV tools — unclosed-quote detection (parity with #5)

**Status:** Completed  
**Source:** Gap after #5 (2026-03-28)

### In plain English

- **What it was:** Several tools still accepted CSV with an unclosed quoted field and produced misleading output instead of a clear error like the viewer, cleaner, and sorter.
- **Why it mattered:** Same input should meet the same trust bar everywhere CSV or TSV is parsed client-side.

**Action:** After each parse loop, if `inQuotes` is still true, throw the same user-facing message as #5; ensure UI catches surface `err.message`. Extend `parseCSVLines` in `site.js` for merge/split/csv-to-tsv row splitting.

**Acceptance:** No listed tool silently completes a full pipeline on input that would fail for unclosed quotes in the sorter/viewer.

**Delivered:** [`js/site.js`](../js/site.js) (`parseCSVLines`), [`js/site.min.js`](../js/site.min.js) (build), [`csv-column-remover/index.html`](../csv-column-remover/index.html), [`csv-column-splitter/index.html`](../csv-column-splitter/index.html), [`csv-column-joiner/index.html`](../csv-column-joiner/index.html), [`csv-row-filter/index.html`](../csv-row-filter/index.html), [`csv-deduplicator/index.html`](../csv-deduplicator/index.html), [`csv-to-tsv/index.html`](../csv-to-tsv/index.html), [`csv-to-json/index.html`](../csv-to-json/index.html), [`csv-to-excel/index.html`](../csv-to-excel/index.html), [`tsv-to-csv/index.html`](../tsv-to-csv/index.html) (TSV-specific message), [`csv-sorter/index.html`](../csv-sorter/index.html) (deferred row-count `parseCSVLines` catch), [`merge-csv/test/merge-test.js`](../merge-csv/test/merge-test.js), [`split-csv/test/split-test.js`](../split-csv/test/split-test.js), [`csv-to-tsv/test/csv-to-tsv-test.js`](../csv-to-tsv/test/csv-to-tsv-test.js).

---

## 23. Other CSV tools — match upload size limits & file-reading UX

**Status:** Completed  
**Source:** Gap after #2 (2026-03-28)

### In plain English

- **What it was:** Several CSV/TSV tools accepted very large uploads with no hard cap, no “loading file” overlay, and no soft warning for 50+ MB inputs — unlike viewer, cleaner, and sorter.
- **Why it mattered:** Inconsistent policy and surprise main-thread stalls on big files.

**Action:** Centralize **50 MB warn / 200 MB hard** checks on `window.TinyDataToolCsvLimits`; use `readFileAsText` + `.drop-zone.file-reading` overlay and optional `status-message--warning` on affected tool pages.

**Acceptance:** No listed upload path loads >200 MB without rejection; 50+ MB shows warning and/or visible busy state during read.

**Delivered:** [`js/site.js`](../js/site.js) + [`js/site.min.js`](../js/site.min.js) (`TinyDataToolCsvLimits`), [`css/global.css`](../css/global.css) + [`css/global.min.css`](../css/global.min.css) (shared `.drop-zone__busy` / `.file-reading` styles), [`merge-csv/index.html`](../merge-csv/index.html), [`split-csv/index.html`](../split-csv/index.html), [`csv-deduplicator/index.html`](../csv-deduplicator/index.html), [`csv-row-filter/index.html`](../csv-row-filter/index.html), [`csv-column-remover/index.html`](../csv-column-remover/index.html), [`csv-column-splitter/index.html`](../csv-column-splitter/index.html), [`csv-column-joiner/index.html`](../csv-column-joiner/index.html), [`csv-to-tsv/index.html`](../csv-to-tsv/index.html), [`csv-to-json/index.html`](../csv-to-json/index.html), [`csv-to-excel/index.html`](../csv-to-excel/index.html), [`tsv-to-csv/index.html`](../tsv-to-csv/index.html).

---

## 26. CSV Cleaner — optional “no header” mode (first row is data)

**Status:** Completed  
**Source:** Backlog #26 (2026-03-28)

### In plain English

- **What it was:** The cleaner always split row 1 into a “header” and the rest into data, so headerless exports mis-labeled the first data row and sort/filter semantics were wrong for those files.
- **Why it mattered:** Many systems emit all data rows with no header row.

**Action:** Checkbox **First row is column header** (default on). When off, treat every parsed row as data; emit output with a synthetic first row `col1`, `col2`, … up to max column width; hint + FAQ.

**Acceptance:** No-header input can be trimmed, deduped, filtered, and sorted without treating the first record as column names.

**Delivered:** [`csv-cleaner/index.html`](../csv-cleaner/index.html) (`firstRowIsHeader`, synthetic header row, FAQ).

---

## 25. Regex Tester — wall-clock cancel / UX when worker is still pegged (ReDoS follow-up)

**Status:** Completed  
**Source:** Backlog #25 (2026-03-28)

### In plain English

- **What it was:** Regex matching ran in a Web Worker with a 50k match cap, but catastrophic backtracking could still burn CPU until the engine finished a single `exec`, with no time budget or obvious “still running” affordance.
- **Why it mattered:** Users could think the tool failed or wonder whether to wait, even though the tab UI stayed responsive.

**Action:** Cooperative wall clock in [`regex-worker.js`](../regex-tester/regex-worker.js) (~8s budget, partial results + warning); main-thread backup `terminate()` (~12s); “Matching…” row with **Stop**; sync fallback loop budget; FAQ.

**Acceptance:** Pathological patterns get visible running state, user cancel, soft time stop with partial output, or hard stop with a clear message—not an unbounded silent peg.

**Delivered:** [`regex-tester/index.html`](../regex-tester/index.html), [`regex-tester/regex-worker.js`](../regex-tester/regex-worker.js).

---

## 27. Text Diff — virtualized / incremental render beyond row cap

**Status:** Completed  
**Source:** Backlog #27 (2026-03-28)

### In plain English

- **What it was:** The diff table only showed the first 4,000 rows with no way to reveal more without re-running on a smaller excerpt; large comparisons hit a hard wall.
- **Why it mattered:** Log and document diffs often exceed a few thousand change rows; users still need a controlled way to grow the view.

**Action:** Cache full diff rows client-side; render an initial chunk (4k); **Load more rows** adds 4k at a time; hard cap **50,000** table rows with clear copy + FAQ; copy text matches visible rows with a footer explaining how to include more.

**Acceptance:** Large diffs can be explored incrementally without a single 50k-row first paint; predictable copy behavior; optional full virtualized recycling left as a future optimization if needed.

**Delivered:** [`text-diff/index.html`](../text-diff/index.html).

---

## 17. New tool — JSON Schema generator

**Status:** Completed  
**Source:** Backlog #17 (2026-03-28)

### In plain English

- **What it was:** No way to bootstrap JSON Schema from a sample document on-site; devs had to hand-write or use external tools.
- **Why it mattered:** High-intent workflow for APIs, configs, and validation pipelines.

**Action:** New tool [`json-schema-generator/`](../json-schema-generator/): infer Draft 07 schema from parsed JSON; options for listing all object keys as `required` and toggling `additionalProperties`; heterogeneous arrays → `oneOf` (capped); copy + download; nav, sitemap, tools index, `docs/tools.md`; `site.js` / `site.min.js` build.

**Acceptance:** Valid JSON in → valid JSON Schema document out; options change output predictably; linked from JSON nav cluster and related-tool overrides.

**Delivered:** [`json-schema-generator/index.html`](../json-schema-generator/index.html), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`docs/tools.md`](../docs/tools.md).

---

## 18. New tool — CSV Column Analyzer (light analytics)

**Status:** Completed  
**Source:** Backlog #18 (2026-03-28)

### In plain English

- **What it was:** No dedicated way on-site to profile CSV columns (cardinality, top values, empties, numeric summaries) without exporting to another tool.
- **Why it mattered:** QA and quick exploration before filter/dedupe/clean workflows.

**Action:** New [`csv-column-analyzer/`](../csv-column-analyzer/): delimiter auto/manual (incl. custom), header toggle, RFC-style parse + unclosed-quote error; **250k** data-row cap with warning; per-column distinct count, top 10 frequencies, empty count; numeric min/max/mean when ≥95% of non-empty cells parse as finite numbers; copy summary JSON; shared CSV byte limits via `TinyDataToolCsvLimits`; nav, sitemap, tools index, `docs/tools.md`, related-tool overrides.

**Acceptance:** Multi-column CSV shows clear per-column stats; documented limits; linked from CSV nav cluster and related tools.

**Delivered:** [`csv-column-analyzer/index.html`](../csv-column-analyzer/index.html), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`docs/tools.md`](../docs/tools.md).

---

## 13. Upgrade — CSV → JSON (schema-aware, smarter)

**Status:** Completed  
**Source:** Backlog #13 (2026-03-28)

### In plain English

- **What it was:** CSV → JSON always emitted string cell values and comma-only parsing; no typed output, header cleanup, nested keys, or delimiter choice.
- **Why it mattered:** APIs and configs expect real JSON types and stable header names; TSV and semicolon exports are common.

**Action:** Extended [`csv-to-json/index.html`](../csv-to-json/index.html): delimiter **Auto** / comma / tab / semicolon / pipe / custom (RFC-style parse, unclosed-quote error); **Simple** (all strings, legacy behavior) vs **Typed** (int/float/bool/null, empty → null); optional **snake_case**, **dedupe** headers (`name_2`, …); optional **nest** dotted keys with explicit conflict error; “Keep as string” list for typed mode; result meta summarizes options; FAQ + hero/schema copy; tests in [`csv-to-json/test/csv-to-json-test.js`](../csv-to-json/test/csv-to-json-test.js).

**Acceptance:** Same CSV exports as before under defaults; typed/nested/normalization opt-in with clear errors on nesting conflicts.

**Delivered:** [`csv-to-json/index.html`](../csv-to-json/index.html), [`csv-to-json/test/csv-to-json-test.js`](../csv-to-json/test/csv-to-json-test.js).

---

## 16. New tool — SQL result formatter (→ CSV / JSON) + optional SQL pretty-print

**Status:** Completed  
**Source:** Backlog #16 (2026-03-28)

### In plain English

- **What it was:** No in-browser path from pasted SQL client grids to JSON/CSV, and no lightweight SQL read formatter on-site.
- **Why it mattered:** Common copy/paste from SSMS-style tools; long-tail SQL + tabular intent.

**Action:** New [`sql-result/`](../sql-result/): tabs **Result → CSV/JSON** (delimiter auto/tab/comma/pipe/2+ spaces; header row; deduped column names; RFC-style CSV export; JSON array of objects; `TinyDataToolCsvLimits` paste/file; 100k row cap; warn ≥25k) and **Format SQL** (lightweight keyword/line-break pretty-print, not a full parser). FAQ: no execution, comma limits, privacy. Nav (Converters), related overrides, sitemap, tools index + ItemList, `docs/tools.md`.

**Acceptance:** Representative grids → valid JSON + CSV; common SELECTs read cleaner after format; ambiguous grid surfaces clear errors.

**Delivered:** [`sql-result/index.html`](../sql-result/index.html), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`docs/tools.md`](../docs/tools.md).

---

## 14. New tool — JSON Diff (structured)

**Status:** Completed  
**Source:** Backlog #14 (2026-03-28)

### In plain English

- **What it was:** No structural JSON comparison on-site—only text diff or manual inspection.
- **Why it mattered:** API/config diffs need path-level adds/removes/changes, not line noise from formatting.

**Action:** New [`json-diff/`](../json-diff/): dual paste + file drop (10 MB/side); recursive diff with JSON Pointer paths; arrays by index; table + legend (add/remove/change); caps (20k diff entries, 800 table rows) with full list in copyable JSON report; `JSON.parse` errors per side; FAQ; nav, sitemap, tools index, `docs/tools.md`, related-tool overrides (`json-viewer`, `json-formatter`, `json-validator`, `text-diff`).

**Acceptance:** Two valid JSON values yield a readable structural diff; invalid input surfaces parse errors.

**Delivered:** [`json-diff/index.html`](../json-diff/index.html), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`docs/tools.md`](../docs/tools.md).

---

## 15. New tool — CSV Diff (tabular, keyed)

**Status:** Completed  
**Source:** Backlog #15 (2026-03-28)

### In plain English

- **What it was:** No keyed comparison for two CSV exports—only generic text diff or manual spreadsheet work.
- **Why it mattered:** “What changed between these two dumps?” is a table problem, not a line-diff problem.

**Action:** New [`csv-diff/`](../csv-diff/): CSV A/B paste + file drop; shared delimiter (auto/comma/tab/semicolon/pipe/custom) + RFC-style parse; primary + optional secondary key (intersection headers); duplicate-key warnings (first row used); adds/removes/changes + unchanged; **hide unchanged**; column-set mismatch warning; `TinyDataToolCsvLimits`; table cap + full TSV report copy/download; HOW TO + FAQ; nav, sitemap, tools index, `docs/tools.md`, related (`csv-deduplicator`, `merge-csv`, `text-diff`).

**Acceptance:** Same-schema CSVs diff on chosen key; missing/extra keys visible; duplicate keys warned.

**Delivered:** [`csv-diff/index.html`](../csv-diff/index.html), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`docs/tools.md`](../docs/tools.md).

---

## 12. New tool — JSON → JSON Transformer (JQ-style lite)

**Status:** Completed  
**Source:** Backlog #12 (2026-03-28)

### In plain English

- **What it was:** No client-side way to reshape JSON (path extract, key pick, array filter) without jq or custom scripts.
- **Why it mattered:** Pipelines often need a smaller JSON blob before CSV export or review.

**Action:** New [`json-transformer/`](../json-transformer/): dot + `[index]` path; optional top-level key pick on objects; optional array filter (property equals string); 10 MB paste/file; no `eval`; copy/download + “use output as input”; HOW TO + FAQ; nav (`NAV_GROUPS`), related (`json-viewer`, `json-formatter`, `json-validator`, `json-diff`, `json-to-csv`), sitemap, tools index + ItemList, `docs/tools.md`.

**Acceptance:** Transformed output from path and/or pick and/or filter; explicit path/type errors.

**Delivered:** [`json-transformer/index.html`](../json-transformer/index.html), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`docs/tools.md`](../docs/tools.md).

---

## 22. JSON tools — Web Worker parse / higher size cap (optional follow-up)

**Status:** Completed  
**Source:** Backlog #22 (2026-03-28)

### In plain English

- **What it was:** Validator capped at 10 MB and parsed on the main thread, so large pastes risked tab jank or rejection.
- **Why it mattered:** Some users only need syntax validation on multi-megabyte JSON.

**Action:** Add [`parse-worker.js`](../json-validator/parse-worker.js) (`JSON.parse` + error message); main thread uses worker for UTF-8 size ≥ **256 KB** when `Worker` exists; cap **25 MB** with worker, **10 MB** fallback without; drop hint + FAQ + HOW TO step; [`script.js`](../json-validator/script.js) handles worker `error` / `postMessage` failure (sync fallback). Viewer unchanged.

**Acceptance:** Documented limits; less main-thread parse work for large input; sub–256 KB / no-worker paths unchanged in behavior.

**Delivered:** [`json-validator/parse-worker.js`](../json-validator/parse-worker.js), [`json-validator/script.js`](../json-validator/script.js), [`json-validator/index.html`](../json-validator/index.html); [`json-transformer/index.html`](../json-transformer/index.html) (FAQ cross-reference).

---

## 30. Audit: Product

**Status:** Completed  
**Source:** Backlog #30 (2026-03-28)

### In plain English

- **What it was:** Product-only pass over nav, homepage, and README for missing surface area and obvious tool gaps.
- **Why it mattered:** Homepage and docs under-represent shipped utilities; YAML is a common adjacent format.

**Action:** Compared [`js/site.js`](../js/site.js) (`ACTIVE_NAV_GROUPS` vs `PRODUCTION_HIDDEN_TOOL_IDS`), [`index.html`](../index.html), [`docs/README.md`](../README.md). **No UX/SEO/reliability findings** in this ticket.

**Acceptance:** New backlog items with concrete fixes (or explicit none).

**Delivered:** **#31** homepage grid parity, **#32** README tools, **#33** JSON↔YAML tool.

---

## 31. Homepage — grid parity vs production nav

**Status:** Completed  
**Source:** Audit: Product #30 (2026-03-28)

### In plain English

- **What it was:** Homepage grids skipped many production-nav tools (JSON diff/transformer, CSV diff/analyzer, several text tools, SQL result, ZIP).
- **Why it mattered:** Organic visitors only saw a subset of what the header offered.

**Action:** [`index.html`](../index.html): add `home-tool-card` rows for JSON viewer/schema/diff/transformer; CSV diff + column analyzer (row-filter → analyzer → sorter order); text diff, Base64, regex, case, HTML encoder; **Converters** section (`sql-result`); **File** section (`zip-combiner`); place JSON formatter after transformer per nav.

**Acceptance:** Prod-visible `NAV_GROUPS` items ⊆ homepage links; no duplicate cards.

**Delivered:** [`index.html`](../index.html).

---

## 33. New tool — JSON ↔ YAML

**Status:** Completed  
**Source:** Audit: Product #30 (2026-03-28)

### In plain English

- **What it was:** No YAML path on-site; configs and CI often pair YAML with JSON.
- **Why it mattered:** Users reached for CLI converters instead of staying in TinyDataTool.

**Action:** New [`json-yaml/`](../json-yaml/): tabs **JSON → YAML** / **YAML → JSON**; bundled **js-yaml 4.1.0** (`js-yaml.min.js`); `tool.js` + `JSON.parse` / `load` / `dump`; 10 MB UTF-8; indent 2/4; copy/download; HOW TO / Why / Privacy / FAQ; nav, related overrides, sitemap, `tools/index.html` + ItemList, `docs/tools.md`, root + All Tools homepage cards.

**Acceptance:** Valid round-trip; parse errors surfaced; limits in FAQ.

**Delivered:** [`json-yaml/index.html`](../json-yaml/index.html), [`json-yaml/tool.js`](../json-yaml/tool.js), [`json-yaml/js-yaml.min.js`](../json-yaml/js-yaml.min.js) (MIT), [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js), [`sitemap.xml`](../sitemap.xml), [`tools/index.html`](../tools/index.html), [`index.html`](../index.html), [`docs/tools.md`](../docs/tools.md).

---

## 32. README — Tools section vs live site

**Status:** Completed  
**Source:** Audit: Product #30 (2026-03-28)

### In plain English

- **What it was:** [`docs/README.md`](../README.md) implied a ~9-tool product; the repo ships far more.
- **Why it mattered:** Contributors and readers trusted a false “complete” list.

**Action:** Replaced stale bullets with links to [All Tools](../tools/index.html), [tools.md](tools.md), and `js/site.js` `NAV_GROUPS` / `PRODUCTION_HIDDEN_TOOL_IDS`; shortened **Project structure** (generic `*/index.html` + tools.md).

**Acceptance:** No implied exhaustive tool list without mirroring nav.

**Delivered:** [`docs/README.md`](../README.md).

---

## 34. Audit: UX

**Status:** Completed  
**Source:** Backlog #34 (2026-03-28)

### In plain English

- **What it was:** Scheduled UX-only audit of shared chrome and representative tab/upload flows.
- **Why it mattered:** Catch a11y/focus gaps without mixing SEO or reliability.

**Action:** Reviewed [`js/site.js`](../js/site.js) (`initNavDrawer`, `initDropZone`, FAQ) and tabbed tools (`json-yaml`, patterns vs `json-diff` / `csv-to-json` drop-zone busy).

**Acceptance:** New tickets with concrete fixes.

**Delivered:** **#35** nav drawer focus on open, **#36** tabpanel `aria-labelledby`, **#37** `initDropZone` `aria-busy` during read.

---

## 35. Nav drawer — focus on open

**Status:** Completed  
**Source:** Audit: UX #34 (2026-03-28)

### In plain English

- **What it was:** Drawer opened without moving focus; only Escape returned focus to the burger.
- **Why it mattered:** Keyboard/SR users had no entry point into the dialog.

**Action:** [`js/site.js`](../js/site.js) `initNavDrawer`: `openDrawer` uses `requestAnimationFrame` to focus `navDrawerClose` or first `.nav-drawer__item`; `closeDrawer({ focusBurger })` returns focus to the burger for overlay, close, and Escape—not when following a drawer link (navigation).

**Acceptance:** Open → focus inside; dismiss without navigation → focus on burger.

**Delivered:** [`js/site.js`](../js/site.js), [`js/site.min.js`](../js/site.min.js).

---

## 36. Tabbed tools — tabpanel `aria-labelledby`

**Status:** Completed  
**Source:** Audit: UX #34 (2026-03-28)

### In plain English

- **What it was:** Shared `panel-main` kept `aria-labelledby="tabJ2Y"` when YAML → JSON was selected.
- **Why it mattered:** Screen readers should name the panel from the active tab.

**Action:** [`json-yaml/tool.js`](../json-yaml/tool.js) `setMode`: set `aria-labelledby` to `tabJ2Y` or `tabY2J`. Other `.tool-tabs` pages (`json-formatter`, `html-encoder-decoder`, `url-encoder-decoder`) already updated the shared panel on tab change; `sql-result` uses separate tabpanels per mode.

**Acceptance:** JSON ↔ YAML updates `aria-labelledby` when switching direction.

**Delivered:** [`json-yaml/tool.js`](../json-yaml/tool.js).

---

## 37. `initDropZone` — `aria-busy` while reading

**Status:** Completed  
**Source:** Audit: UX #34 (2026-03-28)

### In plain English

- **What it was:** Shared `initDropZone` ran `readFileAsText` without `aria-busy` or `.file-reading`, unlike hand-rolled drop zones on CSV/JSON tools.
- **Why it mattered:** Screen readers and consistent busy UI during file load.

**Action:** [`js/site.js`](../js/site.js) `initDropZone`: default `busyDuringRead` applies `aria-busy` + `file-reading` for the read lifecycle (`.finally`); JSDoc + [`templates/tool-page-reference.html`](../templates/tool-page-reference.html) note. [`json-yaml/index.html`](../json-yaml/index.html) + [`json-validator/index.html`](../json-validator/index.html): `.drop-zone__busy` overlay markup.

**Acceptance:** Consumers using only `initDropZone` expose busy during read without duplicate handlers.

**Delivered:** [`js/site.js`](../js/site.js), [`json-yaml/index.html`](../json-yaml/index.html), [`json-validator/index.html`](../json-validator/index.html), [`templates/tool-page-reference.html`](../templates/tool-page-reference.html).

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
