# Backlog

Action items from [`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md), [`README.md`](README.md), and audits or notes.

Item **numbers stay stable** (do not renumber when reprioritizing). Shipped or **closed** items go in [`backlog-archive.md`](backlog-archive.md); append there and remove them from this file.

| Priority | # | Focus |
|----------|---|-------|
| Medium | **4** | CSV Cleaner — Add custom delimiter support |
| Medium | **7** | Regex Tester — Limit warnings & ReDoS protection |
| Medium | **11** | Text Case Converter & Diff — DOM scale constraints |
| Polish | **8** | CSV / JSON Tools — Excel export integration |
| Polish | **9** | All Tools — Robust clipboard fallback & icon state |
| Polish | **10** | JSON Viewer — Mobile action wrapping |
| High | **12** | New tool: JSON → JSON Transformer (JQ-style lite) |
| High | **13** | Upgrade: CSV → JSON (schema-aware, types, nesting) |
| High | **14** | New tool: JSON Diff (structured tree diff) |
| High | **15** | New tool: CSV Diff (keyed rows, field highlights) |
| Medium | **16** | New tool: SQL result / SQL formatter → CSV or JSON |
| Medium | **17** | New tool: JSON Schema generator (+ optional validate later) |
| Medium | **18** | New tool: CSV Column Analyzer (uniques, counts, light stats) |
| Optional | **19** | New tool: Text → URL slug generator (SEO, options) |
| Optional | **20** | New tool: UUID generator / validator (bulk, v4) |
| Optional | **21** | New tool: Unix timestamp ↔ human (timezones, “now”) |
| Medium | **22** | JSON tools — Web Worker parse / higher cap (follow-up to #1) |
| Optional | **23** | Other CSV tools — match viewer/sorter upload limits & reading state |
| Optional | **24** | Other CSV tools — unclosed-quote error (parity with #5) |

**Suggested order:** **7** → **4** → **11** → **8** → **9** → **10** (audit backlog). **Roadmap (new tools):** **19** → **20** → **21** (quick SEO wins) → **13** → **17** → **18** → **16** → **14** → **15** → **12** (largest build last among greenfield). **22** when raising limits safely matters more than new tools.

Each open item below includes **In plain English** — a short, non-technical read of what the ticket is, why you’d care, and what improves if you do it.

---

## 4. CSV Cleaner — Add custom delimiter support

**Status:** Not completed
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it is:** The CSV cleaner assumes everything is separated by commas, unlike the viewer and sorter which let you choose tabs, semicolons, etc.
- **Why you’d do it:** Real-world files from Europe (semicolons) or databases (tabs) currently break in the cleaner.
- **Upside:** Reliable cleaning for any tabular data format.

**Action:** Add delimiter selection (comma, tab, semicolon, pipe, custom) to `csv-cleaner`, similar to `csv-sorter`.

**Acceptance:** Can successfully clean a tab-separated or semicolon-separated file.

---

## 7. Regex Tester — Limit warnings & ReDoS protection

**Status:** Not completed
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it is:** The regex tool quietly stops finding matches after 50,000 iterations to prevent crashes, but doesn't tell the user. Bad regex patterns can still freeze the tab before hitting the limit.
- **Why you’d do it:** Users need to know if the matches they see are incomplete. Tab freezes from bad patterns are a frustrating UX.
- **Upside:** Clear communication of limits and safe execution of complex patterns.

**Action:** Show a visible UI warning when the match loop hits the 50k safety limit. Consider a Web Worker for executing regex to prevent tab hangs (ReDoS).

**Acceptance:** Warning appears if matches are truncated; pathological regex patterns don't hang the main UI.

---

## 8. CSV / JSON Tools — Excel export integration

**Status:** Not completed
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it is:** Tools like CSV Sorter and JSON Viewer only let you export as text/CSV, even though there's a dedicated Excel converter tool elsewhere on the site.
- **Why you’d do it:** People frequently want to sort/clean data and immediately drop it into Excel.
- **Upside:** Smooth, discovered workflow from data manipulation directly to an `.xlsx` file.

**Action:** Add "Download as Excel" capability or prominent cross-links to the `csv-to-excel` / `json-to-excel` converters from the core viewers, sorters, and cleaners.

**Acceptance:** Users can easily go from viewing/sorting CSV/JSON to having an Excel file.

---

## 9. All Tools — Robust clipboard fallback & icon state

**Status:** Not completed
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it is:** "Copy" buttons fail in non-secure contexts or older browsers, and when they succeed (like in JSON to CSV), the "Copied!" text sometimes accidentally deletes the button's icon.
- **Why you’d do it:** Copying is a core feature; it should work reliably and look polished.
- **Upside:** Better compatibility and a glitch-free interface.

**Action:** Add a `document.execCommand('copy')` fallback for `navigator.clipboard`. Fix the copy success state in `json-to-csv` (and others) so it doesn't destroy the SVG icon.

**Acceptance:** Copy works in more environments; button retains its layout/icon when transitioning to "Copied!".

---

## 10. JSON Viewer — Mobile action wrapping

**Status:** Not completed
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it is:** On small mobile screens, the buttons under the JSON viewer don't wrap to a new line and can push off the edge of the screen.
- **Why you’d do it:** Basic responsive design makes the tool usable on phones.
- **Upside:** A clean, accessible layout for all device sizes.

**Action:** Change `.output-actions` from `flex-wrap: nowrap` to `flex-wrap: wrap`.

**Acceptance:** Action buttons stack nicely on narrow viewports without overflowing.

---

## 11. Text Case Converter & Diff — DOM scale constraints

**Status:** Not completed
**Source:** Site Audit (2026-03-28)

### In plain English

- **What it is:** For massive text inputs, the Case Converter copies the text into the page four times, and the Diff tool creates tens of thousands of table rows, bogging down the browser.
- **Why you’d do it:** Big text comparisons or conversions should be fast and not consume excessive memory.
- **Upside:** Better performance and stability for power users with large text payloads.

**Action:** Implement progressive rendering or row limits for huge inputs in `text-diff`. Reduce redundant DOM nodes for `text-case-converter`.

**Acceptance:** Diffing or converting very large texts doesn't cause severe lag or layout thrashing.

---

## 12. New tool — JSON → JSON Transformer (JQ-style lite)

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** A workflow tool that takes JSON in and outputs **reshaped** JSON: pick fields, filter arrays, simple maps — not just view/pretty-print.
- **Why you’d do it:** Power users constantly need “give me only these keys” or “filter this array” without spinning up jq or a script.
- **Upside:** Moves TinyDataTool from passive utilities to something people use in real pipelines. **Tradeoff:** Must stay bounded (lite) so support and security stay manageable in the browser.

**Action:** New tool page under repo root (e.g. `json-transformer/`). **MVP:** paste/upload JSON → built-in recipes (pick paths, filter by key, unwrap array) + copy/download result. **Advanced mode:** small expression language or path DSL (document limits; no arbitrary JS `eval`). Reuse [`site-rules.md`](site-rules.md) template; wire into [`js/site.js`](../js/site.js) `NAV_GROUPS` (JSON group).

**SEO / content:** Target intent: “transform JSON online”, “JSON map fields”, “pick fields from JSON”, “filter JSON array online”. FAQ: large files, privacy (client-side), difference vs formatter. Avoid textbook “what is JSON” per [`seo-rules.md`](seo-rules.md).

**Acceptance:** User can produce a transformed JSON document from sample input using at least pick + filter + map-style operations; errors are explicit (invalid path, type mismatch). Linked from `json-viewer`, `json-to-csv`, All Tools.

---

## 13. Upgrade — CSV → JSON (schema-aware, smarter)

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** The existing **CSV → JSON** tool works; this ticket **levels it up** for a top real-world use case: typed values, sane headers, optional nested structure.
- **Why you’d do it:** Many exports need `numbers` and `booleans` as real JSON types, not strings; headers often need normalization for APIs.
- **Upside:** Stronger reason to choose this site over a one-line converter. **Limit:** Nested JSON from flat CSV is heuristic — document behavior (e.g. column prefix `parent.child` or explicit JSON path column).

**Action:** Extend [`csv-to-json/`](../csv-to-json/) (or split “advanced” panel): (1) **type inference** — detect int/float/bool/null from cells (with override toggles per column). (2) **header normalization** — trim, optional snake_case, dedupe. (3) **nested object option** — configurable rules; fallback flat array of objects remains default. Preserve current behavior as “Simple” preset.

**SEO / content:** “CSV to JSON with types”, “convert CSV to nested JSON”. FAQ: delimiter, encoding, row as object vs array of arrays.

**Acceptance:** Same CSV can export as today (strings) or as typed/nested JSON per user options; documented limits; no silent wrong nesting without user opting in.

---

## 14. New tool — JSON Diff (structured)

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Compare two JSON documents **by structure**: added/removed keys, changed scalars, array edits — not just line-by-line text diff.
- **Why you’d do it:** Higher intent than generic text diff; devs and API users search “compare JSON files” / “JSON diff viewer”.
- **Upside:** Pairs with JSON viewer/formatter/transformer for internal linking depth.

**Action:** New tool (e.g. `json-diff/`). **UI:** side-by-side trees or inline highlights; color legend for add/remove/change. **Tech:** deep-equal walk with path tracking; consider array alignment (by index vs by id field — document). Large-file guardrails (warn / truncate) aligned with backlog **#1**.

**SEO / content:** “JSON diff online”, “compare two JSON files”, “JSON diff viewer”. FAQ: privacy, max size, vs text diff tool.

**Acceptance:** Two JSON inputs produce a clear structural diff for objects and arrays; invalid JSON shows parse errors with position where possible. Cross-link from `text-diff`, `json-viewer`, `json-validator`.

---

## 15. New tool — CSV Diff (tabular, keyed)

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Compare two CSVs **as tables**: align rows by a chosen **key column** (e.g. ID), highlight row adds/removes and **cell-level** changes.
- **Why you’d do it:** Text diff is wrong tool for “what changed between these two exports?” — structured diff is the intent.
- **Upside:** Natural fit next to CSV sorter, deduplicator, merge; strengthens the CSV cluster and internal links.

**Action:** New tool (e.g. `csv-diff/`). User picks **key column(s)** (and optional secondary sort). Diff engine: parse both with shared delimiter options (reuse patterns from `csv-sorter`). Output: summary counts + table or row list with per-field badges. Handle duplicate keys gracefully (warn, list rows).

**SEO / content:** “CSV diff online”, “compare CSV files”, “Excel export diff” (secondary). FAQ: key column, encoding, large files.

**Acceptance:** Two CSVs with same schema diff correctly on a chosen ID column; missing/extra rows visible; delimiter auto-detect or user-selected. Linked from `csv-deduplicator`, `merge-csv`, `text-diff`.

---

## 16. New tool — SQL result formatter (→ CSV / JSON) + optional SQL pretty-print

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Paste **tabular query output** (spaces/tabs/pipes) or a **SQL string** and get a clean **CSV** or **JSON** table — or pretty-printed SQL for reading.
- **Why you’d do it:** Bridges everyday dev/BI workflows without another desktop app.
- **Upside:** Strong long-tail: “format SQL result as CSV”, “SQL output to JSON online”. **Limit:** Not a full SQL engine — parsing is heuristic for result grids; document supported patterns.

**Action:** New tool (e.g. `sql-formatter/` or split tabs: “Result grid” vs “SQL text”). **Result path:** detect columns (fixed-width vs delimiter), normalize to CSV/JSON array of objects. **SQL path:** use a client-side SQL formatter library (bundle size + license check). Export copy/download.

**SEO / content:** Target paste-from-SSMS/pgAdmin style examples in FAQ. Clarify “no execution — format/convert only”.

**Acceptance:** Representative pasted result sets convert to valid CSV and JSON; SQL pretty-print works on common SELECT snippets; clear error when input is ambiguous.

---

## 17. New tool — JSON Schema generator

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Paste sample **JSON** → generated **JSON Schema** (types, required keys, array item shapes) that teams can refine for APIs and validation.
- **Why you’d do it:** High dev-intent traffic; constant need when standing up endpoints or OpenAPI-adjacent docs.
- **Upside:** Future hook: “validate instance against this schema” (separate ticket or phase 2). **Limit:** Inference from one sample can be wrong — UI should say “draft schema” and offer strictness options.

**Action:** New tool (e.g. `json-schema-generator/`). Walk parsed JSON; emit draft Schema (JSON Schema version pinned in UI). Options: infer `required` vs all optional, `additionalProperties`, array tuple vs list. Copy/download schema.

**SEO / content:** “JSON to JSON Schema”, “generate JSON Schema online”. FAQ: one sample vs multiple samples (future), compatibility with validators.

**Acceptance:** Valid JSON in → valid JSON Schema document out; options change output predictably. Link from `json-validator`, `json-viewer`.

---

## 18. New tool — CSV Column Analyzer (light analytics)

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Pick a CSV column (or all columns) and see **unique values**, **counts**, and light **stats** (numeric min/max/mean where applicable) — “understand this file” not just edit it.
- **Why you’d do it:** Small step upstack toward exploration; complements row filter and deduplicator.
- **Upside:** Differentiated utility for QA and quick profiling. **Limit:** Client-side memory — row caps or streaming strategy for huge files (align with backlog **#2**).

**Action:** New tool (e.g. `csv-column-analyzer/`). Upload/paste CSV; column picker; results panel: cardinality, top-N values, null/empty counts; numeric column histogram optional (simple bins). Export summary as CSV/JSON optional.

**SEO / content:** “CSV column frequency”, “count unique values in CSV online”. FAQ: file size, delimiter.

**Acceptance:** Works on multi-column CSV with clear stats per selected column; performance acceptable on moderately large files with documented limits. Linked from `csv-row-filter`, `csv-deduplicator`, `csv-viewer`.

---

## 19. New tool — Text → URL slug generator

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Turn a title or phrase into a **URL-safe slug** with options: lowercase, separator, strip accents, remove **stopwords**, max length.
- **Why you’d do it:** Very high search volume, fast build, broad non-technical audience.
- **Upside:** Cheap SEO surface area; pairs with trim/case tools.

**Action:** New tool (e.g. `slug-generator/`). Live preview; toggles for hyphen vs underscore, transliteration, stopword list (small default + custom). Copy button; optional bulk lines → slugs.

**SEO / content:** “URL slug generator”, “create slug from title online”. FAQ: SEO best practices (short, one line — avoid fluff per seo-rules).

**Acceptance:** Slugs are stable and predictable given options; document character stripping rules. Link from `text-case-converter`, `trim-whitespace`, `url-encoder-decoder`.

---

## 20. New tool — UUID generator / validator

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Generate **RFC 4122 v4** UUIDs (single or **bulk**), and **validate** pasted UUID strings (strip braces, case-insensitive).
- **Why you’d do it:** Constant micro-need in dev/test; strong query volume relative to implementation cost.
- **Upside:** Low effort, high utility; good for homepage / All Tools density.

**Action:** New tool (e.g. `uuid-generator/`). Use `crypto.randomUUID` where available with fallback. Bulk count input with cap (e.g. 10k) and warning. Validator: multi-line paste, mark valid/invalid per line.

**SEO / content:** “UUID generator online”, “generate UUID v4”, “validate UUID”. FAQ: version, collision (practical note, one sentence).

**Acceptance:** Generated IDs pass validator; bulk generation doesn’t freeze UI (chunk or debounce). Linked from `regex-tester`, `json-formatter` (IDs in JSON).

---

## 21. New tool — Unix timestamp ↔ human datetime

**Status:** Not completed  
**Source:** Product roadmap (2026-03-28)

### In plain English

- **What it is:** Convert **Unix seconds or milliseconds** ↔ local or chosen **timezone** human-readable datetime; **“Now”** one-click for both directions.
- **Why you’d do it:** Huge search demand; mixes dev logs with general “what time is this epoch?”
- **Upside:** Broad traffic; complements timestamp-heavy JSON/CSV workflows.

**Action:** New tool (e.g. `timestamp-converter/`). Inputs: epoch + unit toggle; timezone select (IANA list or subset); output ISO + locale string. Batch mode: one timestamp per line. DST labeled in UI text.

**SEO / content:** “Unix timestamp converter”, “epoch to date online”, “milliseconds to date”. FAQ: UTC vs local, ms vs s.

**Acceptance:** Round-trip is correct for test vectors; “Now” fills current epoch and human form. Linked from `json-viewer`, `csv-sorter` (date columns optional future tie-in).

---

## 22. JSON tools — Web Worker parse / higher size cap (optional follow-up)

**Status:** Not completed  
**Source:** Gap from shipping #1 (2026-03-28)

### In plain English

- **What it is:** Viewer and validator now **reject** inputs over **10 MB** to protect the main thread. A worker could parse or validate off-thread and allow a **higher** cap with less jank.
- **Why you’d do it:** Some users have legitimate 15–50 MB JSON and only need validation, not a full tree DOM.
- **Upside:** Fewer “false negatives” on size while keeping the tab responsive. **Limit:** Tree viewer still needs a DOM strategy (virtualization) for huge graphs — worker alone is not enough for #1’s viewer path.

**Action:** Spike `JSON.parse` or tokenizer in a Web Worker for `json-validator`; consider text-only or lazy tree for viewer. Coordinate caps with any future virtualization ticket.

**Acceptance:** Documented higher safe limit or same limit with materially less UI freeze on multi-MB paste; no regression on sub-10 MB flows.

---

## 23. Other CSV tools — match upload size limits & file-reading UX

**Status:** Not completed  
**Source:** Gap after #2 (2026-03-28)

### In plain English

- **What it is:** `csv-viewer` and `csv-cleaner` now share the sorter’s **50 MB / 200 MB** policy and loading overlay; **merge-csv**, **split-csv**, **deduplicator**, **row-filter**, etc. may still load huge files with weaker feedback.
- **Why you’d do it:** One consistent safety story across the CSV cluster.
- **Upside:** Fewer surprise freezes; easier support.

**Action:** Audit each CSV tool’s `FileReader` / `readFileAsText` path; reuse the same constants, warning banner, and drop-zone busy pattern where uploads exist.

**Acceptance:** No CSV upload entry point accepts >200 MB without rejection; ≥50 MB paths show a visible warning or busy state consistent with viewer/cleaner/sorter.

---

## 24. Other CSV tools — unclosed-quote detection (parity with #5)

**Status:** Not completed  
**Source:** Gap after #5 (2026-03-28)

### In plain English

- **What it is:** Viewer and cleaner now error on unclosed quotes; **merge-csv**, **split-csv**, **deduplicator**, **row-filter**, **column** tools, etc. may still parse with the old “silent drift” behavior.
- **Why you’d do it:** Same trust bar everywhere CSV is parsed in-browser.
- **Upside:** Fewer bad merges/splits from a single stray `"`.

**Action:** Find each tool’s CSV parse loop; after EOF push, if `inQuotes` throw the same `CSV_UNCLOSED_QUOTE_MSG` string (or shared helper in `site.js` later).

**Acceptance:** No tool silently completes a full pipeline on input that sorter/viewer would reject for unclosed quotes.

## Audit inbox

Raw lines from `scripts/site-audit/audit.py` (optional). **Triage** each into a numbered ticket and a priority row, then delete the line here.

<!-- Appended by automation — insert below this comment. -->

<!--
Copy and place above **Audit inbox** for each new ticket:

## N. Short title

**Status:** Not completed
**Source:** Where this came from (audit date, doc, URL, etc.).

### In plain English

- **What it is:** …
- **Why you’d do it:** …
- **Upside:** … (optional tradeoffs/limitations)

**Action:** Implementation notes (files, approach).

**Acceptance:** How you know it’s done.

-->
