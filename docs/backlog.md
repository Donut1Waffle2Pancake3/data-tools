# Backlog

## Execution rules (read every run)

You are an **execution agent** in this repo. **Sources of truth:** this file ([`backlog.md`](backlog.md)) for active work; [`backlog-archive.md`](backlog-archive.md) for completed/closed work.

**Mindset:** Reassess priority every run—ordering may be wrong. Reprioritize when you find higher-impact work. Optimize for **product quality over time**.

### Each run

1. **Evaluate** — Review all items; reorder only if clearly wrong (no unnecessary reshuffles).
2. **Select** — One task: best mix of user impact, risk reduction, leverage, and effort vs payoff.
3. **Scope** — Too large → split and reprioritize. Blocked by dependencies → reorder.
4. **Execute** — Real changes (code, UX, SEO, etc.). No analysis-only stops. Tight, production-quality diffs.
5. **Discover** — While working, note bugs, weak errors, UX dead ends, performance, SEO gaps, high-value features. Add to this file: short title, 1–2 line description, correct priority row + ticket section.
6. **Complete** — Move finished items to [`backlog-archive.md`](backlog-archive.md); remove them here.
7. **Maintain** — Merge duplicates, drop stale items, keep formatting consistent; **preserve stable ticket IDs** unless unavoidable.
8. **Idle** — Nothing meaningful left to execute? See [When no actionable tasks remain](#when-no-actionable-tasks-remain): **one audit type per cycle** (rotation), not a broad mixed audit.

### Priority heuristic (override if clearly wrong)

1. Broken core functionality  
2. Incorrect results / missing error handling  
3. UX blockers / dead ends  
4. Trust & accuracy  
5. High-leverage SEO  
6. Performance  
7. Small high-value features  
8. Visual polish  

### Constraints

Do not ask permission; do not over-explain; do not multitask unrelated tickets; do not ignore prioritization without reason.

### Output (concise)

Task selected · why (1–2 lines) · what shipped · new backlog items (if any) · reprioritization (if any).

### Goal

Each run improves **both** the product and this backlog (best task → execute → discover → refine).

---

Action items from [`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md), [`README.md`](README.md), and audits or notes.

Item **numbers stay stable** (do not renumber when reprioritizing). Shipped or **closed** items go in [`backlog-archive.md`](backlog-archive.md); append there and remove them from this file.

| Priority | # | Focus |
|----------|---|-------|
| High | **12** | New tool: JSON → JSON Transformer (JQ-style lite) |
| High | **13** | Upgrade: CSV → JSON (schema-aware, types, nesting) |
| High | **14** | New tool: JSON Diff (structured tree diff) |
| High | **15** | New tool: CSV Diff (keyed rows, field highlights) |
| Medium | **16** | New tool: SQL result / SQL formatter → CSV or JSON |
| Medium | **17** | New tool: JSON Schema generator (+ optional validate later) |
| Medium | **18** | New tool: CSV Column Analyzer (uniques, counts, light stats) |
| Medium | **22** | JSON tools — Web Worker parse / higher cap (follow-up to #1) |
| Optional | **25** | Regex Tester — wall-clock cancel / UX when worker is still pegged (ReDoS follow-up) |
| Optional | **26** | CSV Cleaner — optional “no header” mode (first row is data) |
| Optional | **27** | Text Diff — virtualized / incremental render beyond row cap |

**Suggested order:** **Roadmap (new tools):** **13** → **17** → **18** → **16** → **14** → **15** → **12** (largest build last among greenfield). **22** when raising limits safely matters more than new tools.

Each open item below includes **In plain English** — a short, non-technical read of what the ticket is, why you’d care, and what improves if you do it.

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

## 25. Regex Tester — wall-clock cancel / UX when worker is still pegged (ReDoS follow-up)

**Status:** Not completed  
**Source:** Gap after #7 (2026-03-28)

### In plain English

- **What it is:** Matching now runs in a **Web Worker** and the **50k** cap shows a warning, but catastrophic backtracking can still pin a CPU core until the engine yields—no hard wall-clock stop yet.
- **Why you’d do it:** Power users may still think the site “hung” even though the tab stays clickable.
- **Upside:** Clear “still working / cancelled” state and optional time budget without blocking the main thread.

**Action:** Explore chunked matching, `postMessage` ping + `worker.terminate()` after N ms, or engine-specific mitigations; pair with visible “running…” / cancel UI.

**Acceptance:** Pathological pattern cannot peg the experience indefinitely without user-visible feedback or a clean abort path.

---

## 26. CSV Cleaner — optional “no header” mode (first row is data)

**Status:** Not completed  
**Source:** Gap after #4 (2026-03-28)

### In plain English

- **What it is:** The cleaner always treats row 1 as column headers; files with no header row get a misleading “header” and wrong sort column semantics.
- **Why you’d do it:** Exports from some systems are all data rows.
- **Upside:** Sort/filter apply to real data without inventing a fake header.

**Action:** Add a checkbox (e.g. “First row is header”) defaulting to on; when off, treat every row as data and use synthetic column labels or 1-based indices in UI copy.

**Acceptance:** A no-header TSV/CSV can be deduped and sorted without corrupting the first record.

---

## 27. Text Diff — virtualized / incremental render beyond row cap

**Status:** Not completed  
**Source:** Gap after #11 (2026-03-28)

### In plain English

- **What it is:** Large diffs now cap **rendered** table rows, but users who need the full inline table still hit a wall.
- **Why you’d do it:** Power users comparing logs want scroll-through without splitting files manually.
- **Upside:** Keeps DOM bounded while exposing more than a fixed row budget.

**Action:** Virtualize the diff table (e.g. recycle rows on scroll) or stream chunks with “Load more”; ensure accessibility and copy/export behavior stay predictable.

**Acceptance:** 50k+ line diffs remain scrollable without creating tens of thousands of live `<tr>` nodes.

---

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

## When no actionable tasks remain

If no meaningful tasks are available (everything completed, archived, or not worth doing), **do not** run a broad, mixed-domain audit.

1. **Select the next audit type** from the rotation (see [Audit rotation](#audit-rotation)). Infer the last completed audit from the most recent `Audit:` entry in [`backlog-archive.md`](backlog-archive.md); if none exists, start with **Product**.
2. **Create a new backlog task** (then stop execution for this run):
   - **Title:** `Audit: <type>` (type is one of: Product, UX, SEO, Reliability)
   - Clear, scoped description of what to review in that category only
   - **LOW** priority; place at the **bottom** of the backlog (new stable ID + table row + ticket section)
3. **Stop** — Do not execute the audit in the same run; the next run picks up the audit ticket or other work.

---

## When executing an audit task

When **`Audit: <type>`** is the selected task:

- Audit **only** that category (no mixing Product + SEO in one pass, etc.).
- Work systematically across: key tool pages, shared components / [`js/site.js`](../js/site.js) patterns, and relevant docs ([`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md)).
- **Output:** concrete backlog items only—no vague observations. Each finding needs a **clear problem** and a **specific fix**.
- Add findings to this file with correct priority; merge duplicates and trim overlap.
- **Completion:** Move the audit task to [`backlog-archive.md`](backlog-archive.md). The next time you hit idle, the new `Audit:` task must be the **next** type in the rotation (never the same type twice in a row).

---

## Audit rotation

**Order (cycle):** Product → UX → SEO → Reliability → repeat.

**Rule:** Do not use the same audit type on consecutive idle spawns. After archiving `Audit: UX`, the next idle-created audit is **SEO** (then Reliability, then Product, …).

**Types (scope hint):**

| Type | Focus |
|------|--------|
| **Product** | New tools, meaningful feature gaps on existing tools |
| **UX** | Flows, friction, clarity, accessibility |
| **SEO** | Titles, metadata, internal linking, content gaps |
| **Reliability** | Errors, edge cases, performance |

## Agent workspace notes

You may add **other `.md` files** under `docs/` (or elsewhere in the repo) whenever they help you work faster or more consistently—e.g. audit checklists, per-sprint scratchpads, decision logs, tool-specific investigation notes, or copy-paste templates. Keep them **focused and maintained** so they stay trustworthy; avoid duplicating what already lives in [`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md), or this backlog unless it genuinely reduces friction.
