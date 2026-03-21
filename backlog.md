# Tool Backlog

> Build note: Always follow `site_rules.md` for structure and `seo_rules.md` for content.
> QA note: Test functionality before marking as complete.

---

## 1. JSON Viewer
Slug: /json-viewer/
H1: JSON Viewer
Purpose: View JSON in a readable, formatted tree structure.
Primary keyword: json viewer
Secondary keywords: json viewer online, json tree viewer
Related tools: JSON Formatter, JSON Validator, JSON to CSV
UI behavior:
- Display JSON in formatted, readable structure
- Prefer collapsible tree view if feasible
- Fallback: formatted JSON text
Notes:
- Do not overbuild UI
- Prioritize readability and speed
Status: Completed

---

## 2. CSV Viewer
Slug: /csv-viewer/
H1: CSV Viewer
Purpose: Preview CSV data in a table format.
Primary keyword: csv viewer
Secondary keywords: view csv online, csv table viewer
Related tools: CSV to JSON, CSV Column Remover, CSV Filter
UI behavior:
- Render CSV as a simple table
- Handle headers correctly
- No need for advanced features (sorting, filtering)
Notes:
- Keep table lightweight and fast
Status: Completed

---

## 3. Text Diff Checker
Slug: /text-diff/
H1: Text Diff Checker
Purpose: Compare two blocks of text and highlight differences.
Primary keyword: text diff
Secondary keywords: compare text online, diff checker
Related tools: Remove Duplicate Lines, Sort Lines, Find and Replace
UI behavior:
- Two input fields (left/right)
- Show differences clearly
- Prefer inline diff; side-by-side optional
Notes:
- Highlight additions/removals
- Avoid complex UX
Status: Completed

---

## 4. Base64 Encoder / Decoder
Slug: /base64-encoder-decoder/
H1: Base64 Encoder Decoder
Purpose: Encode and decode Base64 strings.
Primary keyword: base64 encode decode
Secondary keywords: base64 encoder, base64 decoder
Related tools: URL Encoder/Decoder, JSON Formatter
UI behavior:
- Single input/output
- Auto-detect encode vs decode
Notes:
- Match behavior of URL encoder tool
Status: Completed

---

## 5. Regex Tester
Slug: /regex-tester/
H1: Regex Tester
Purpose: Test regular expressions against text input.
Primary keyword: regex tester
Secondary keywords: regex test online, regex tool
Related tools: Find and Replace, Text Diff, Remove Duplicate Lines
UI behavior:
- Input for regex
- Input for text
- Highlight matches in real-time
Notes:
- Keep minimal
- No need for advanced flags UI initially
Status: Completed

---

## 6. CSV to Excel
Slug: /csv-to-excel/
H1: Convert CSV to Excel
Purpose: Convert CSV files into Excel (.xlsx) format.
Primary keyword: csv to excel
Secondary keywords: convert csv to xlsx, csv to excel online
Related tools: CSV to JSON, CSV Viewer
UI behavior:
- Upload or paste CSV
- Download XLSX file
Notes:
- Use client-side library
- Keep conversion simple and fast
Status: Completed

---

## 7. JSON to Excel
Slug: /json-to-excel/
H1: Convert JSON to Excel
Purpose: Convert JSON data into Excel format.
Primary keyword: json to excel
Secondary keywords: json to xlsx, convert json to excel
Related tools: JSON to CSV, CSV to Excel
UI behavior:
- Accept JSON array of objects
- Output XLSX
Notes:
- Similar to JSON → CSV logic
Status: Completed

---

## 8. CSV Cleaner
Slug: /csv-cleaner/
H1: Clean CSV Data
Purpose: Clean CSV data by removing duplicates, trimming, filtering, and sorting.
Primary keyword: clean csv
Secondary keywords: csv cleaner, clean csv data
Related tools: CSV Column Remover, CSV Filter, Remove Duplicate Lines
UI behavior:
- Combine:
  - remove duplicates
  - trim whitespace
  - filter rows
  - sort
Notes:
- This is a workflow tool (more complex)
- Keep UI simple despite multiple features
Status: Completed

---

## 9. JSON Minifier
Slug: /json-minifier/
H1: JSON Minifier
Purpose: Minify JSON by removing whitespace and formatting.
Primary keyword: json minifier
Secondary keywords: minify json, compress json
Related tools: JSON Formatter, JSON Validator
UI behavior:
- Input JSON
- Output minified JSON
Notes:
- Very simple tool
- Must be fast
Status: Completed

---

## 10. Text Case Converter
Slug: /text-case-converter/
H1: Text Case Converter
Purpose: Convert text between uppercase, lowercase, title case, etc.
Primary keyword: text case converter
Secondary keywords: change text case, uppercase lowercase tool
Related tools: Trim Whitespace, Remove Duplicate Lines, Find and Replace
UI behavior:
- Input text
- Multiple output options:
  - UPPERCASE
  - lowercase
  - Title Case
Notes:
- Show multiple outputs at once if possible
Status: Completed