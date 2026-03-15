/**
 * Generate favicon.ico and apple-touch-icon.png from assets/favicon.svg
 * Run: npm run generate-favicons
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'assets', 'favicon.svg');
const outDir = path.join(root, 'assets');

async function main() {
  const sharp = require('sharp');
  const pngToIco = require('png-to-ico');

  const svg = fs.readFileSync(svgPath);

  // PNGs at 16, 32, 48 for ICO; 180 for apple-touch-icon
  const sizes = [16, 32, 48];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(svg)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.push(buf);
    await fs.promises.writeFile(
      path.join(outDir, `favicon-${size}x${size}.png`),
      buf
    );
  }

  const ico = await pngToIco(pngBuffers);
  await fs.promises.writeFile(path.join(outDir, 'favicon.ico'), ico);

  const appleTouch = await sharp(svg)
    .resize(180, 180)
    .png()
    .toBuffer();
  await fs.promises.writeFile(
    path.join(outDir, 'apple-touch-icon.png'),
    appleTouch
  );

  console.log('Generated: assets/favicon.ico, assets/apple-touch-icon.png (+ intermediates in assets/)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
