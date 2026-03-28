# Backlog

## Push cadence (remote sync)

Batch on **`main`** (or current branch). **Tracker below is source of truth.**

**Tracker (5 slots):** `X X X X _`

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
| Medium | **40** | Homepage — H1 + hero subheading vs [`seo-rules.md`](seo-rules.md) (length, no promo words in H1, single outcome blurb) |
| Medium | **41** | Tool pages — align stray How-to H2s with “How to + keyword” |
| Low | **42** | `tools/index.html` — keep JSON-LD `ItemList` `numberOfItems` + order aligned with [`js/site.js`](../js/site.js) nav (incl. hidden ids) |

**Suggested order:** **40**, **41**, **42**.

---

## 40. Homepage — H1 + hero vs seo-rules

**Status:** Not completed  
**Source:** Audit: SEO #38 (2026-03-28)

### In plain English

- **What it is:** [`index.html`](../index.html) H1 is long, uses parentheses, repeats “free”-style positioning where rules reserve modifiers for `<title>`; hero uses several stacked subparagraphs vs one tight outcome + trust line.
- **Why you’d do it:** Homepage is the primary brand/query landing; align with H1/subheading rules for consistency and snippet clarity.

**Action:** Rewrite `hero-heading` + `hero__sub` block: H1 = short verb + object (≈3–8 words, no “free/best” in H1); collapse subs to 1–2 sentences (outcome + local/no upload). Keep keywords in body sections below as needed.

**Acceptance:** H1/subheading match [`seo-rules.md`](seo-rules.md) Header/SEO Structure; no loss of factual trust claims elsewhere on page.

---

## 41. Tool pages — How-to H2 wording

**Status:** Not completed  
**Source:** Audit: SEO #38 (2026-03-28)

### In plain English

- **What it is:** Several tools use `id="how-heading"` text that is not **“How to + keyword”** (e.g. “How it works”, marketing-style headlines).
- **Why you’d do it:** [`seo-rules.md`](seo-rules.md) requires a consistent How-to block for intent matching.

**Action:** Update `#how-heading` (and matching `section-label` if needed) on: [`csv-sorter/index.html`](../csv-sorter/index.html) (“How it works” → e.g. “How to sort CSV online”), [`sql-result/index.html`](../sql-result/index.html), [`html-encoder-decoder/index.html`](../html-encoder-decoder/index.html), [`url-encoder-decoder/index.html`](../url-encoder-decoder/index.html), [`split-csv/index.html`](../split-csv/index.html), [`merge-csv/index.html`](../merge-csv/index.html), [`zip-combiner/index.html`](../zip-combiner/index.html). Use concise “How to …” phrasing per tool primary keyword.

**Acceptance:** Each listed page’s how-section H2 starts with **How to** and names the task; 3-step body unchanged unless a step title must match.

---

## 42. Tools hub — JSON-LD ItemList vs nav

**Status:** Not completed  
**Source:** Audit: SEO #38 (2026-03-28)

### In plain English

- **What it is:** [`tools/index.html`](../tools/index.html) embeds `numberOfItems` and a fixed `itemListElement` list; easy to drift when tools are added, reordered, or hidden via `NAV_GROUPS` / prod flags.
- **Why you’d do it:** Rich result / internal consistency; avoids advertising URLs that are hidden in prod.

**Action:** After any nav change, reconcile ItemList positions, names, and `numberOfItems` with [`js/site.js`](../js/site.js) `NAV_GROUPS` + `PRODUCTION_HIDDEN_TOOL_IDS` (same source of truth as [`sitemap.xml`](../sitemap.xml) comment). Optionally add a short note in [`docs/tools.md`](tools.md) or site-rules for editors.

**Acceptance:** ItemList count and URLs match shipped nav intent; hidden tools omitted or documented if intentionally listed for staging only.

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
