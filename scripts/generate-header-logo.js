/**
 * Generate a header-sized logo (164×82, 2× display) from the full-size logo.
 * Reduces payload for the header and satisfies PageSpeed "improve image delivery".
 * Run: npm run generate-header-logo
 */
const path = require('path');

const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const sourcePath = path.join(assetsDir, 'Logo - TinyDataTool.png');
const outPath = path.join(assetsDir, 'logo-header.png');

const WIDTH = 164;
const HEIGHT = 82;

async function main() {
  const sharp = require('sharp');
  const fs = require('fs');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source logo not found:', sourcePath);
    process.exit(1);
  }

  await sharp(sourcePath)
    .resize(WIDTH, HEIGHT)
    .png()
    .toFile(outPath);

  console.log('Generated', outPath, `(${WIDTH}×${HEIGHT})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
