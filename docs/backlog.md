# Backlog

## Push cadence (remote sync)

Batch on **`main`** (or current branch). **Tracker below is source of truth.**

**Tracker (5 slots):** `_ _ _ _ _`

**Rules**

1. **Start** — Check tracker **before** picking a task.  
2. **If full (`X X X X X`)** — **Push-only run**: commit all → `git push origin`. Fix errors → retry. Reset to `_ _ _ _ _`. **Stop** (no task).  
3. **After completed task** — Move ticket to [`backlog-archive.md`](backlog-archive.md), then add one `X` to the **leftmost `_`**. **Do not add** for: push-only runs; audit-only; backlog edits; incomplete tasks.

**Why** — Batch pushes; simpler rollback.

---

### Writing style

Be **extremely concise**. Use the **fewest words possible** while preserving meaning.  
Prefer short phrases over sentences; remove filler, repetition, and commentary.  
Keep this file **compact and scannable**.

---

## Execution rules (read every run)

You are an **execution agent**. **Sources:** [`backlog.md`](backlog.md) (active), [`backlog-archive.md`](backlog-archive.md) (done).

**Mindset:** Reprioritize every run. Optimize for **long-term product quality**.

### Each run

0. **Push gate** — Follow [Push cadence](#push-cadence-remote-sync). If tracker = **`X X X X X`**, run push-only and **stop**.  
1. **Evaluate** — Review all; reorder only if clearly wrong.  
2. **Select** — One task (impact × leverage ÷ effort).  
3. **Scope** — Split if large; reorder if blocked.  
4. **Execute** — Ship real changes (code/UX/SEO). No analysis-only stops.  
5. **Discover** — Add items (title + 1–2 lines + priority + ticket).  
6. **Complete** — Move done → [`backlog-archive.md`](backlog-archive.md); remove here.  
7. **Maintain** — Merge dupes; drop stale; keep format; **preserve IDs**.  
8. **Idle** — If nothing actionable, run **one audit type** (see [no tasks](#when-no-actionable-tasks-remain)).  
9. **Push tracker** — If a task was **completed** (incl. finished **`Audit:`**), add `X`; else no change.

### Priority heuristic (override if wrong)

1. Broken core  
2. Incorrect results / missing errors  
3. UX blockers  
4. Trust & accuracy  
5. High-leverage SEO  
6. Performance  
7. Small high-value features  
8. Visual polish  

### Constraints

No permission; no over-explaining; no unrelated multitasking; follow priority.

### Output (concise)

Task · why (1–2 lines) · shipped · new items · reprioritization.

### Goal

Each run improves **product + backlog** (select → execute → discover → refine).

---

Action items from [`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md), [`README.md`](README.md), and audits or notes.

Item **numbers stay stable** (do not renumber when reprioritizing). Shipped or **closed** items go in [`backlog-archive.md`](backlog-archive.md); append there and remove them from this file.

| Priority | # | Focus |
|----------|---|-------|
| High | **12** | New tool: JSON → JSON Transformer (JQ-style lite) |
| High | **14** | New tool: JSON Diff (structured tree diff) |
| High | **15** | New tool: CSV Diff (keyed rows, field highlights) |
| Medium | **16** | New tool: SQL result / SQL formatter → CSV or JSON |
| Medium | **22** | JSON tools — Web Worker parse / higher cap (follow-up to #1) |

**Suggested order:** **Roadmap (new tools):** **14** → **15** → **12** (largest build last among greenfield). **22** when raising limits safely matters more than new tools.

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

If nothing meaningful remains, **do not** run a mixed audit.

If an **open** `Audit:` ticket exists, **do not create another**—pick it up later.

1. **Select next audit type** (see [Audit rotation](#audit-rotation)).  
   Check [`backlog-archive.md`](backlog-archive.md) for the **last completed `Audit:`** (newest = bottom).  
   If none, start with **Product**. Always pick the **next** type (no repeats).

2. **Create backlog task** (then stop):
   - **Title:** `Audit: <type>` (Product, UX, SEO, Reliability)  
   - Scoped description (that category only)  
   - **LOW** priority; add to **bottom** (new ID + row + ticket)

3. **Stop** — Do not execute the audit this run.

---

## When executing an audit task

When **`Audit: <type>`** is selected:

- Audit **only that category** (no mixing).  
- Review: key tool pages, shared components / [`js/site.js`](../js/site.js), and relevant docs ([`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md)).  
- **Output:** backlog items only—each with a **clear problem + specific fix** (no vague notes).  
- Add with correct priority; merge dupes; trim overlap.  
- **Complete:** move to [`backlog-archive.md`](backlog-archive.md) with heading **`Audit:`** (e.g. `## N. Audit: SEO`). Next idle audit = **next type in rotation** (no repeats).

---

## Audit rotation

**Cycle:** Product → UX → SEO → Reliability → repeat  
**Rule:** No consecutive types. Next = successor (UX→SEO, Reliability→Product).

**Types (scope):**

| Type | Focus |
|------|-------|
| **Product** | New tools/pages, feature gaps |
| **UX** | Flows, friction, clarity, accessibility |
| **SEO** | Titles, metadata, links, content gaps |
| **Reliability** | Errors, edge cases, performance |

## Agent workspace notes

You may add `.md` files (e.g. in `docs/`) to work faster—checklists, scratchpads, logs, notes, templates.  
Keep them **focused and maintained**; avoid duplicating [`site-rules.md`](site-rules.md), [`seo-rules.md`](seo-rules.md), or this backlog unless it reduces friction.
