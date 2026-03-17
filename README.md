# TinyDataTool — Data Tools

Free, browser-based utilities for working with CSV and JSON files. All tools run locally; no uploads, no tracking.

**Live site:** [tinydatatool.com](https://tinydatatool.com)

## Tools

- **Split CSV** — Break a large CSV into smaller files by row count
- **Merge CSV** — Combine multiple CSV files into one
- **CSV Column Remover** — Remove columns from a CSV
- **CSV Deduplicator** — Remove duplicate rows
- **CSV Sorter** — Sort rows by column
- **JSON Formatter** — Pretty-print and validate JSON
- **JSON to CSV** — Convert JSON arrays of objects to CSV
- **CSV to JSON** — Convert CSV to JSON
- **CSV to TSV** / **TSV to CSV** — Convert between comma- and tab-separated

## Run locally

Static HTML/CSS/JS. Open `index.html` in a browser, or use a local server:

```bash
npx serve .
```

Then visit `http://localhost:3000` (or the port shown).

## Favicons

Favicons are generated from `assets/favicon.svg`. To regenerate after editing the SVG:

```bash
npm install
npm run generate-favicons
```

This updates `assets/favicon.ico` and `assets/apple-touch-icon.png`. Commit the new files if you want the site to use them.

## Project structure

- `index.html` — Homepage
- `404.html` — Custom not-found page
- `split-csv/`, `merge-csv/`, `csv-column-remover/`, `csv-deduplicator/`, `csv-sorter/`, `json-formatter/`, `json-to-csv/`, `csv-to-json/`, `csv-to-tsv/`, `tsv-to-csv/` — Tool pages (each has `index.html`)
- `tools/index.html` — All Tools listing
- `css/global.css` — Shared styles
- `js/site.js` — Header, nav, and related-tools (injected into each page)
- `assets/` — Logo, favicon SVG
- `sitemap.xml`, `robots.txt` — SEO

## License

Private / all rights reserved (or add your license here).
