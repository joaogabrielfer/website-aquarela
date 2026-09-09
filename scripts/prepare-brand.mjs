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
const trimmedMetadata = await sharp(trimmed).metadata();
if (!trimmedMetadata.width || !trimmedMetadata.height)
  throw new Error('Não foi possível ler o derivado aparado');
await fs.writeFile(`${output}/logo-aquarela.png`, trimmed);
for (const width of [360, 400, 440, 660, 880])
  await sharp(trimmed)
    .resize({ width, withoutEnlargement: true })
    .png()
    .toFile(`${output}/logo-aquarela-${width}.png`);

// Derivado autorizado do símbolo circular, sem redesenho ou recoloração.
// A marca aparada mantém o símbolo à esquerda; a largura é calculada pela
// altura para continuar reproduzível se as margens externas forem ajustadas.
// O texto do wordmark começa depois de x≈232 no derivado 731x213; 219px
// preserva o símbolo completo sem carregar qualquer fragmento de AQUARELA.
const symbolWidth = Math.min(trimmedMetadata.width, 219);
const symbol = await sharp(trimmed)
  .extract({
    left: 0,
    top: 0,
    width: symbolWidth,
    height: trimmedMetadata.height,
  })
  .png()
  .toBuffer();
for (const [filename, size] of [
  ['favicon-32.png', 32],
  ['favicon-192.png', 192],
  ['apple-touch-icon.png', 180],
  ['favicon-512.png', 512],
]) {
  await sharp(symbol)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(`public/${filename}`);
}
