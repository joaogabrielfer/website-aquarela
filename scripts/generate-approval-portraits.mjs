// Deriva variantes dos recortes com transparência; nunca altera os originais.
// Uso: pnpm exec node scripts/generate-approval-portraits.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = path.resolve('assets/approvals/portraits');
const outputDir = path.resolve('public/media/approvals');
await fs.mkdir(outputDir, { recursive: true });
const files = (await fs.readdir(inputDir)).filter((file) =>
  file.endsWith('.png'),
);

for (const file of files) {
  const slug = path.basename(file, '.png');
  for (const width of [400, 800]) {
    await sharp(path.join(inputDir, file))
      .resize({
        width,
        height: (width * 5) / 4,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(path.join(outputDir, `${slug}-${width}.webp`));
  }
}
console.log(`[approvals] ${files.length} retratos, variantes 400 e 800 px`);
