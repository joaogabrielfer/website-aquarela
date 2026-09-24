import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const widths = [480, 768, 1200, 1600];
const sources = [
  ['hero-colegio-06.jpeg', 'hero-colegio'],
  ['brinquedoteca-01.jpeg', 'brinquedoteca-01'],
  ['brinquedoteca-02.jpeg', 'brinquedoteca-02'],
  ['brinquedoteca-03.jpeg', 'brinquedoteca-03'],
  ['brinquedoteca-04.jpeg', 'brinquedoteca-04'],
  ['cantina.png', 'cantina'],
  ['sala-google-for-education.png', 'sala-google-for-education'],
  ['laboratorio-ciencias.png', 'laboratorio-ciencias'],
  ['patio.png', 'patio'],
  ['sala-bancas-azuis.png', 'sala-bancas-azuis'],
  ['sala-bancas-vermelhas.png', 'sala-bancas-vermelhas'],
  ['studio-danca.png', 'studio-danca'],
  ['sala-infantil.png', 'sala-infantil'],
];

const sourceDir = path.resolve('assets/photos');
const outputDir = path.resolve('public/media');
await fs.mkdir(outputDir, { recursive: true });

for (const [file, slug] of sources) {
  const input = path.join(sourceDir, file);
  const metadata = await sharp(input).metadata();
  if (!metadata.width) throw new Error(`Largura ausente em ${file}`);

  for (const width of widths.filter((value) => value <= metadata.width)) {
    const output = path.join(outputDir, `${slug}-${width}.webp`);
    await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(output);
  }
}

console.log(
  `[media] ${sources.length} originais processados em ${widths.length} larguras`,
);
