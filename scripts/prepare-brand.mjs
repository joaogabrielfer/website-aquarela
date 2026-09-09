import sharp from 'sharp';
import fs from 'node:fs/promises';
const input = 'assets/logo-aquarela.PNG';
const output = 'public/brand';
await fs.mkdir(output, { recursive: true });
const metadata = await sharp(input).metadata();
if (metadata.width === undefined || metadata.height === undefined)
  throw new Error('Não foi possível ler as dimensões da logo original');
// A última coluna é a linha opaca/escura espúria fornecida no original.
// Removemos somente essa coluna antes de aparar as margens brancas externas.
const withoutStrayBorder = await sharp(input)
  .extract({
    left: 0,
    top: 0,
    width: metadata.width - 1,
    height: metadata.height,
  })
  .png()
  .toBuffer();
const trimmed = await sharp(withoutStrayBorder)
  .trim({ background: { r: 255, g: 255, b: 255, alpha: 1 }, threshold: 8 })
  .png()
  .toBuffer();
await fs.writeFile(`${output}/logo-aquarela.png`, trimmed);
for (const width of [360, 400, 440, 660, 880])
  await sharp(trimmed)
    .resize({ width, withoutEnlargement: true })
    .png()
    .toFile(`${output}/logo-aquarela-${width}.png`);
