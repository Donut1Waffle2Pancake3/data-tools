# Site audit (scheduled)

## What it does

1. Reads **`audit-queue.md`**: first non-comment path (comma-separated = multiple files in one audit).
2. Calls **OpenAI** (`AUDIT_MODEL`, default `gpt-4o-mini`) with JSON output:
   - Scores **1–10** for: features, SEO, UX, error handling.
   - Summary, detailed findings, and suggested **backlog tasks** (with `pending` / `ready` / etc.).
3. Appends a section to **`audit-results.md`** (scores + narrative).
4. Appends tasks under **`backlog.md` → To do** with IDs like `T-20250322-143045-1`.
5. **Rotates** that queue entry to the bottom of **`audit-queue.md`**.

## GitHub setup

1. **Repository secret:** `OPENAI_API_KEY` — your OpenAI API key.
2. **Optional repository variable:** `AUDIT_MODEL` — e.g. `gpt-4o-mini` or `gpt-4o` (if unset, the script uses `gpt-4o-mini`).

Workflow file: `.github/workflows/site-audit.yml`  
Default schedule: **`:30` every hour UTC**. Edit the `cron` expression to change that.

## Local run

From repo root (requires `OPENAI_API_KEY` in the environment):

```bash
pip install -r scripts/site-audit/requirements.txt
set OPENAI_API_KEY=sk-...   # Windows
python scripts/site-audit/audit.py
```

## Backlog workflow

- **To do:** tasks the audit appended; use **`ready`** when you want an implementer (human or future automation) to pick them up.
- **Completed:** move finished items here and mark **`done`** (and `[x]`).

## Implementer automation

See `.github/workflows/backlog-implement.yml` — currently a **manual** stub. Add schedule or steps there only after you decide on PR-based or reviewed automation.
