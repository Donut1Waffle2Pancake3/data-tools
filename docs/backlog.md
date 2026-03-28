# Backlog

## Push cadence (remote sync)

Batch on **`main`** (or current branch). **Tracker below is source of truth.**

**Tracker (5 slots):** `X X X X X`

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
| Medium | **36** | Tabbed tools — tabpanel `aria-labelledby` |
| Low | **37** | `initDropZone` — `aria-busy` while reading |

**Suggested order:** **36**, **37**.

---

## 36. Tabbed tools — tabpanel `aria-labelledby`

**Status:** Not completed  
**Source:** Audit: UX #34 (2026-03-28)

### In plain English

- **What it is:** Shared `role="tabpanel"` often keeps `aria-labelledby` fixed to the first tab while the second tab is selected.
- **Why you’d do it:** Screen readers should hear the active tab’s label for the visible panel.

**Action:** Audit pages with `.tool-tabs` (e.g. [`json-yaml/tool.js`](../json-yaml/tool.js), [`json-formatter`](../json-formatter/index.html) inline script): on tab change, set `aria-labelledby` on the panel to the active tab’s `id`.

**Acceptance:** JSON ↔ YAML + JSON formatter (and any other tab UIs) update `aria-labelledby` when switching tabs.

---

## 37. `initDropZone` — `aria-busy` while reading

**Status:** Not completed  
**Source:** Audit: UX #34 (2026-03-28)

### In plain English

- **What it is:** [`initDropZone`](../js/site.js) reads files asynchronously but does not set `aria-busy` on the drop zone; custom tools (json-diff, csv-to-json) add it manually.
- **Why you’d do it:** Consistent “working” state for assistive tech on paste/upload paths that only use shared `initDropZone`.

**Action:** Extend `initDropZone` (opt-in or default): set `aria-busy="true"` and optional `file-reading` class from `readFileAsText` start until settle; document in template reference. Roll out to [`json-yaml/tool.js`](../json-yaml/tool.js), [`json-validator/script.js`](../json-validator/script.js) if no duplicate handlers.

**Acceptance:** At least one consumer-only drop zone exposes busy during read without double-wiring.

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
