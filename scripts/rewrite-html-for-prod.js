/**
 * Rewrites HTML files for production: global.min.css, site.min.js.
 * Run only during production build (e.g. on Vercel). Keeps repo using
 * global.css and site.js so local dev shows changes immediately.
 */

const fs = require("fs");
const path = require("path");

const htmlFiles = [
  "index.html",
  "404.html",
  "tools/index.html",
  "split-csv/index.html",
  "merge-csv/index.html",
  "csv-column-remover/index.html",
  "csv-column-splitter/index.html",
  "csv-column-joiner/index.html",
  "csv-deduplicator/index.html",
  "csv-sorter/index.html",
  "csv-row-filter/index.html",
  "json-to-csv/index.html",
  "json-to-tsv/index.html",
  "json-validator/index.html",
  "json-formatter/index.html",
  "csv-to-json/index.html",
  "csv-to-tsv/index.html",
  "tsv-to-csv/index.html",
];

const root = path.resolve(__dirname, "..");

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");
  content = content
    .replace(/href="css\/global\.css"/g, 'href="css/global.min.css"')
    .replace(/href="\.\.\/css\/global\.css"/g, 'href="../css/global.min.css"')
    .replace(/src="js\/site\.js"/g, 'src="js/site.min.js"')
    .replace(/src="\.\.\/js\/site\.js"/g, 'src="../js/site.min.js"');
  fs.writeFileSync(filePath, content);
}

console.log("Rewrote HTML to use global.min.css and site.min.js for production.");
