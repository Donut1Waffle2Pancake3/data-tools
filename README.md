# TinyTools — Data Tools

Free, browser-based utilities for working with CSV and JSON files. All tools run locally; no uploads, no tracking.

**Live site:** [tinydatatool.com](https://tinydatatool.com)

## Tools

- **Split CSV** — Break a large CSV into smaller files by row count
- **Merge CSV** — Combine multiple CSV files into one
- **JSON to CSV** — Convert JSON arrays of objects to CSV
- **CSV to TSV** — Convert comma-separated to tab-separated format

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

This updates `favicon.ico` and `apple-touch-icon.png` in the project root. Commit the new files if you want the site to use them.

## Project structure

- `index.html` — Homepage
- `404.html` — Custom not-found page
- `split-csv/`, `merge-csv/`, `json-to-csv/`, `csv-to-tsv/` — Tool pages (each has `index.html`)
- `css/global.css` — Shared styles
- `js/header.js`, `js/footer.js`, `js/related-tools.js`, `js/global.js` — Shared scripts
- `assets/` — Logo, favicon SVG
- `sitemap.xml`, `robots.txt` — SEO

## License

Private / all rights reserved (or add your license here).
