/**
 * Rewrites HTML files to reference global.min.css instead of global.css.
 * Run only during production build (e.g. on Vercel). Keeps repo using
 * global.css so local dev shows CSS changes immediately.
 */

const fs = require("fs");
const path = require("path");

const htmlFiles = [
  "index.html",
  "404.html",
  "tools/index.html",
  "split-csv/index.html",
  "merge-csv/index.html",
  "json-to-csv/index.html",
  "json-formatter/index.html",
  "csv-to-json/index.html",
  "csv-to-tsv/index.html",
  "tsv-to-csv/index.html",
  "csv-column-remover/index.html",
  "csv-column-splitter/index.html",
  "csv-deduplicator/index.html",
  "csv-sorter/index.html",
  "csv-row-filter/index.html",
];

const root = path.resolve(__dirname, "..");

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");
  content = content
    .replace(/href="css\/global\.css"/g, 'href="css/global.min.css"')
    .replace(/href="\.\.\/css\/global\.css"/g, 'href="../css/global.min.css"');
  fs.writeFileSync(filePath, content);
}

console.log("Rewrote HTML to use global.min.css for production.");
