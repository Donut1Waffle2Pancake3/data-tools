#!/usr/bin/env python3
"""
Site audit runner for GitHub Actions: reads audit-queue.md, audits first entry via OpenAI,
appends scores to audit-results.md, appends tasks to backlog.md, rotates the queue.

Env:
  OPENAI_API_KEY   (required)
  AUDIT_MODEL      (optional, default gpt-4o-mini)
  REPO_ROOT        (optional, default cwd)
  MAX_FILE_CHARS   (optional, default 120000) per file before truncation
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

REPO_ROOT = Path(os.environ.get("REPO_ROOT", os.getcwd())).resolve()
QUEUE_PATH = REPO_ROOT / "audit-queue.md"
BACKLOG_PATH = REPO_ROOT / "backlog.md"
RESULTS_PATH = REPO_ROOT / "audit-results.md"
API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
MODEL = (os.environ.get("AUDIT_MODEL") or "gpt-4o-mini").strip() or "gpt-4o-mini"
MAX_FILE_CHARS = int(os.environ.get("MAX_FILE_CHARS", "120000"))


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)


def split_queue(text: str) -> tuple[list[str], list[str]]:
    lines = text.splitlines()
    first_path_idx = None
    for i, line in enumerate(lines):
        s = line.strip()
        if s and not s.startswith("#"):
            first_path_idx = i
            break
    if first_path_idx is None:
        return lines, []
    header_lines = lines[:first_path_idx]
    paths: list[str] = []
    for line in lines[first_path_idx:]:
        s = line.strip()
        if s and not s.startswith("#"):
            paths.append(s)
    return header_lines, paths


def rotate_queue_text(text: str) -> str | None:
    header_lines, paths = split_queue(text)
    if not paths:
        return None
    rotated = paths[1:] + [paths[0]]
    body = "\n".join(rotated)
    if header_lines:
        return "\n".join(header_lines).rstrip() + "\n\n" + body + "\n"
    return body + "\n"


def normalize_queue_path(entry: str) -> str:
    return entry.strip().lstrip("@").strip()


def read_targets(entry: str) -> tuple[str, str]:
    """Return (label for logs, concatenated file contents)."""
    parts = [normalize_queue_path(p) for p in entry.split(",") if normalize_queue_path(p)]
    if not parts:
        die("Empty queue entry", 2)
    chunks: list[str] = []
    for rel in parts:
        path = REPO_ROOT / rel
        if not path.is_file():
            die(f"File not found: {rel}", 2)
        raw = path.read_text(encoding="utf-8", errors="replace")
        if len(raw) > MAX_FILE_CHARS:
            raw = raw[:MAX_FILE_CHARS] + "\n\n… [truncated]\n"
        chunks.append(f"### File: `{rel}`\n\n```\n{raw}\n```\n")
    label = ",".join(parts)
    return label, "\n\n".join(chunks)


SYSTEM_PROMPT = """You are a senior web engineer auditing static HTML tool pages for a data utilities site (TinyDataTool).
You must respond with a single JSON object only (no markdown outside JSON). Use this exact shape:
{
  "scores": {
    "features": <integer 1-10>,
    "seo": <integer 1-10>,
    "ux": <integer 1-10>,
    "error_handling": <integer 1-10>
  },
  "summary": "<2-4 sentences>",
  "detailed_findings": ["<string>", "..."],
  "backlog_tasks": [
    { "title": "<concise actionable title>", "status": "pending" }
  ]
}
Rules:
- scores must be integers from 1 through 10 (higher = better).
- backlog_tasks: concrete gaps (SEO meta, a11y, UX polish, error handling, missing features). Use status "pending" unless clearly safe to mark "ready".
- detailed_findings: at least 3 strings, specific to the files.
- Do not include tasks that are already perfect; focus on gaps and risks."""


def call_openai(files_blob: str, page_label: str) -> dict:
    user = f"""Audit target (repo-relative): {page_label}

Evaluate: **features** (capability vs a CSV sorter), **SEO** (titles, meta, semantics, structured data if present), **UX** (layout, clarity, loading states, mobile), **error handling** (empty input, bad files, edge cases in JS).

Source files:

{files_blob}
"""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
    }
    r = requests.post(url, headers=headers, json=body, timeout=120)
    if r.status_code != 200:
        die(f"OpenAI API error {r.status_code}: {r.text[:2000]}", 3)
    data = r.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        die(f"Unexpected API response: {e}", 3)
    return json.loads(content)


def validate_payload(obj: dict) -> dict:
    scores = obj.get("scores") or {}
    required = ("features", "seo", "ux", "error_handling")
    out_scores = {}
    for k in required:
        v = scores.get(k)
        if not isinstance(v, int) or not (1 <= v <= 10):
            die(f"Invalid or missing score for {k}: {v!r}", 3)
        out_scores[k] = v
    summary = (obj.get("summary") or "").strip()
    if not summary:
        die("Missing summary", 3)
    findings = obj.get("detailed_findings") or []
    if not isinstance(findings, list):
        die("detailed_findings must be a list", 3)
    tasks = obj.get("backlog_tasks") or []
    if not isinstance(tasks, list):
        die("backlog_tasks must be a list", 3)
    return {
        "scores": out_scores,
        "summary": summary,
        "detailed_findings": [str(x).strip() for x in findings if str(x).strip()],
        "backlog_tasks": tasks,
    }


def append_audit_results(
    path: Path,
    page_label: str,
    iso_ts: str,
    run_id: str,
    payload: dict,
) -> None:
    scores = payload["scores"]
    table = (
        "| Dimension | Score (1–10) |\n"
        "|-----------|---------------|\n"
        f"| Features | {scores['features']} |\n"
        f"| SEO | {scores['seo']} |\n"
        f"| UX | {scores['ux']} |\n"
        f"| Error handling | {scores['error_handling']} |\n"
    )
    findings = "\n".join(f"- {f}" for f in payload["detailed_findings"]) or "- _(none)_"
    block = f"""
---

## `{page_label}` — {iso_ts}

**Run ID:** `{run_id}`

{table}

### Summary

{payload["summary"]}

### Detailed findings

{findings}

"""
    existing = path.read_text(encoding="utf-8")
    path.write_text(existing.rstrip() + "\n" + block, encoding="utf-8")


def append_backlog_tasks(
    path: Path,
    page_label: str,
    run_id: str,
    tasks: list,
) -> None:
    content = path.read_text(encoding="utf-8")
    lines_out: list[str] = []
    for i, t in enumerate(tasks, 1):
        if not isinstance(t, dict):
            continue
        title = str(t.get("title", "")).replace("\n", " ").strip() or "Untitled task"
        status = str(t.get("status", "pending")).strip().lower()
        if status not in ("pending", "ready", "in_progress", "blocked", "wontfix"):
            status = "pending"
        tid = f"T-{run_id}-{i}"
        lines_out.append(f"- [ ] **{tid}** `{status}` — ({page_label}) {title}")
    if not lines_out:
        return
    block = "\n".join(lines_out) + "\n"
    marker = "## To do"
    if marker not in content:
        content = content.rstrip() + f"\n\n{marker}\n\n{block}"
        path.write_text(content, encoding="utf-8")
        return
    idx = content.find(marker)
    rest = content[idx:]
    ce = rest.find("-->")
    if ce != -1:
        insert_at = idx + ce + 3
        while insert_at < len(content) and content[insert_at] in "\r\n":
            insert_at += 1
        new_content = content[:insert_at] + "\n" + block + content[insert_at:]
    else:
        nl = content.find("\n", idx)
        insert_at = nl + 1 if nl != -1 else len(content)
        new_content = content[:insert_at] + block + content[insert_at:]
    path.write_text(new_content, encoding="utf-8")


def main() -> None:
    if not API_KEY:
        die("OPENAI_API_KEY is not set", 2)

    if not QUEUE_PATH.is_file():
        die(f"Missing {QUEUE_PATH}", 2)

    queue_text = QUEUE_PATH.read_text(encoding="utf-8")
    _, paths = split_queue(queue_text)
    if not paths:
        print("Audit queue has no paths; skipping.")
        return

    entry = paths[0]
    page_label, files_blob = read_targets(entry)

    now = datetime.now(timezone.utc)
    iso_ts = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    run_id = now.strftime("%Y%m%d-%H%M%S")

    print(f"Auditing: {page_label} (run {run_id})")
    raw = call_openai(files_blob, page_label)
    payload = validate_payload(raw)

    append_audit_results(RESULTS_PATH, page_label, iso_ts, run_id, payload)
    append_backlog_tasks(BACKLOG_PATH, page_label, run_id, payload["backlog_tasks"])

    new_queue = rotate_queue_text(queue_text)
    if new_queue is not None:
        QUEUE_PATH.write_text(new_queue, encoding="utf-8")

    print("Done: updated audit-results.md, backlog.md, audit-queue.md")


if __name__ == "__main__":
    main()
