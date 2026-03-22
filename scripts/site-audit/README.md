# Site audit (manual)

The **scheduled GitHub Actions workflow was removed** from this repo. You can still run the audit script locally when you want LLM-assisted scores and backlog suggestions.

## What the script does

1. Reads **`audit-queue.md`**: first path-shaped line (comma-separated = multiple files in one audit).
2. Calls **Google Gemini** (`GEMINI_MODEL`, default `gemini-3.1-flash-lite-preview`) with **JSON** output:
   - Scores **1–10** for: features, SEO, UX, error handling.
   - Summary, detailed findings, and suggested **backlog tasks** (with `pending` / `ready` / etc.).
3. Appends a section to **`audit-results.md`** (scores + narrative).
4. Appends tasks under **`backlog.md` → To do** with IDs like `T-20250322-143045-1`.
5. **Rotates** that queue entry to the bottom of **`audit-queue.md`**.

## Local run

From repo root (requires `GEMINI_API_KEY` in the environment):

```bash
pip install -r scripts/site-audit/requirements.txt
export GEMINI_API_KEY=...   # macOS/Linux
set GEMINI_API_KEY=...      # Windows CMD
python scripts/site-audit/audit.py
```

Optional: set **`GEMINI_MODEL`** to another allowed model id if the default is unavailable.

## Backlog

- **To do:** triage or edit tasks; use **`ready`** when you want something implemented next.
- **Completed:** move finished items here and mark **`done`** (and `[x]`).
