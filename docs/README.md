# TinyDataTool — Data Tools

Free, browser-based utilities for working with CSV and JSON files. All tools run locally with no uploads or accounts.

**Live site:** [tinydatatool.com](https://tinydatatool.com)

## Tools

The site ships **many** CSV, JSON, text, file, and converter tools. The list here is **not** kept in sync with every release.

- **Browse all utilities:** [All Tools](../tools/index.html) (same directory as the live site).
- **Markdown catalog:** [docs/tools.md](tools.md) — URLs grouped like the navigation.
- **Source of truth for names and order:** [`js/site.js`](../js/site.js) → `NAV_GROUPS`. Deployed pages outside nav: [`prod-hidden-tools.md`](prod-hidden-tools.md).

## Product scope

- **ZIP creation in the browser (many loose files → one `.zip`):** **Out of scope.** Whole-archive compression needs a full file tree in memory (or a streaming story we do not ship), duplicate path rules are easy to get wrong, and save/download behavior varies by browser. Desktop archive utilities already cover this well. The site’s ZIP tool is **[Batch ZIP Extractor](../zip-combiner/index.html)** — **extract multiple archives**, not build new ones.

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

- `docs/` — Markdown notes (backlog, backlog archive, site/SEO rules, [tools catalog](tools.md))
- `index.html` — Homepage
- `404.html` — Custom not-found page
- `*/index.html` — One folder per tool at repo root (see [tools.md](tools.md)); shared header/footer/related links from `js/site.js`
- `tools/index.html` — All Tools listing
- `css/global.css` — Shared styles
- `js/site.js` — Navigation config (`NAV_GROUPS`), header, footer, related-tools, shared helpers
- `assets/` — Logo, favicon SVG
- `sitemap.xml`, `robots.txt` — SEO

## License

Private / all rights reserved (or add your license here).
