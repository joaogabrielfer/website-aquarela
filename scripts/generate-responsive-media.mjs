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
  ['sala-bancas-azuis-aula.jpeg', 'sala-bancas-azuis-aula'],
  ['sala-bancas-vermelhas.png', 'sala-bancas-vermelhas'],
  ['studio-danca.png', 'studio-danca'],
  ['sala-infantil.png', 'sala-infantil'],
  ['piscina-angulo-principal.jpg', 'piscina-angulo-principal'],
  ['piscina-angulo-complementar.jpg', 'piscina-angulo-complementar'],
  ['quadra-coberta-angulo-principal.jpg', 'quadra-coberta-angulo-principal'],
  [
    'quadra-coberta-angulo-complementar.jpg',
    'quadra-coberta-angulo-complementar',
  ],
  ['sala-infantil-criancas-estudo.png', 'sala-infantil-criancas-estudo'],
  [
    'sala-infantil-mesas-coloridas-tablets.png',
    'sala-infantil-mesas-coloridas-tablets',
  ],
  ['sala-bancas-vermelhas-estudo.png', 'sala-bancas-vermelhas-estudo'],
  ['infantil-atividade-com-pecas.jpeg', 'infantil-atividade-com-pecas'],
  ['ensino-atividade-no-caderno.jpeg', 'ensino-atividade-no-caderno'],
  ['ensino-participacao-em-sala.jpeg', 'ensino-participacao-em-sala'],
  ['ensino-estudantes-na-escada.jpeg', 'ensino-estudantes-na-escada'],
  ['espaco-de-leitura.jpeg', 'espaco-de-leitura'],
];

const sourceDir = path.resolve('assets/photos');
const outputDir = path.resolve('public/media');
await fs.mkdir(outputDir, { recursive: true });

for (const [file, slug] of sources) {
  const input = path.join(sourceDir, file);
  const metadata = await sharp(input).metadata();
  if (!metadata.width) throw new Error(`Largura ausente em ${file}`);

  const outputWidths = slug === 'hero-colegio' ? [...widths, 2400] : widths;
  for (const width of outputWidths.filter((value) => value <= metadata.width)) {
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
