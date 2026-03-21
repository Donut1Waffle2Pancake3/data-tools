/**
 * Rewrites HTML files for production: global.min.css, site.min.js.
 * Run only during production build (e.g. on Vercel). Keeps repo using
 * global.css and site.js so local dev shows changes immediately.
 *
 * Discovers all .html files under the repo (except node_modules / .git) so
 * new tool pages are included without editing this list.
 */

const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set(["node_modules", ".git"]);

function collectHtmlFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      out.push(...collectHtmlFiles(full));
    } else if (e.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

const root = path.resolve(__dirname, "..");
const htmlFiles = collectHtmlFiles(root);

let count = 0;
for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes("global.css") && !content.includes("/site.js")) continue;

  const next = content
    .replace(/href="css\/global\.css"/g, 'href="css/global.min.css"')
    .replace(/href="\.\.\/css\/global\.css"/g, 'href="../css/global.min.css"')
    .replace(/src="js\/site\.js"/g, 'src="js/site.min.js"')
    .replace(/src="\.\.\/js\/site\.js"/g, 'src="../js/site.min.js"');

  if (next !== content) {
    fs.writeFileSync(filePath, next);
    count += 1;
  }
}

console.log(
  `Rewrote ${count} HTML file(s) to use global.min.css and site.min.js for production.`
);
