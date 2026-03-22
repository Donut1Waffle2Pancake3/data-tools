# Site audit (scheduled)

## What it does

1. Reads **`audit-queue.md`**: first non-comment path (comma-separated = multiple files in one audit).
2. Calls **Google Gemini** (`GEMINI_MODEL`, default `gemini-3.1-flash-lite-preview`) with **JSON** output:
   - Scores **1–10** for: features, SEO, UX, error handling.
   - Summary, detailed findings, and suggested **backlog tasks** (with `pending` / `ready` / etc.).
3. Appends a section to **`audit-results.md`** (scores + narrative).
4. Appends tasks under **`backlog.md` → To do** with IDs like `T-20250322-143045-1`.
5. **Rotates** that queue entry to the bottom of **`audit-queue.md`**.

## GitHub setup

1. **Repository secret:** `GEMINI_API_KEY` — create a key at [Google AI Studio](https://aistudio.google.com/apikey) (or Google Cloud console for production keys).
2. **Optional repository variable:** `GEMINI_MODEL` — e.g. `gemini-3.1-flash-lite-preview`, `gemini-2.5-flash` (if unset, the script uses `gemini-3.1-flash-lite-preview`).

Remove or ignore any old **`OPENAI_API_KEY`** / **`AUDIT_MODEL`** secrets; they are no longer used by this workflow.

Workflow file: `.github/workflows/site-audit.yml`  
Default schedule: **`:30` every hour UTC**. Edit the `cron` expression to change that.

## Local run

From repo root (requires `GEMINI_API_KEY` in the environment):

```bash
pip install -r scripts/site-audit/requirements.txt
export GEMINI_API_KEY=...   # macOS/Linux
set GEMINI_API_KEY=...      # Windows CMD
python scripts/site-audit/audit.py
```

## Backlog workflow

- **To do:** tasks the audit appended; use **`ready`** when you want an implementer (human or future automation) to pick them up.
- **Completed:** move finished items here and mark **`done`** (and `[x]`).

## Implementer automation

See `.github/workflows/backlog-implement.yml` — currently a **manual** stub. Add schedule or steps there only after you decide on PR-based or reviewed automation.
