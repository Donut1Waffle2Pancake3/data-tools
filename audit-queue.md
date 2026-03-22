# Audit queue (rotating)

One entry per audit run. The **first line** (non-empty, not a comment) is audited next; after each run it moves to the **bottom** of the list.

- Use repo-relative paths from the project root.
- Optional: multiple files in one audit, comma-separated (no spaces), e.g. `csv-sorter/index.html,css/global.css`.
- Lines starting with `#` are ignored as comments.

csv-sorter/index.html
