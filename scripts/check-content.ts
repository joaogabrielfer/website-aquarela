import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import sharp from 'sharp';
import { z } from 'zod';
import {
  Activity,
  Album,
  Approval,
  Environment,
  FAQ,
  HomePageCopy,
  Media,
  PageCopy,
  School,
  SeasonalBanner,
  Segment,
} from '../src/lib/content/schemas.js';

const errors: string[] = [];
const root = path.resolve('content');
const read = (file: string): unknown =>
  yaml.load(fs.readFileSync(path.join(root, file), 'utf8'));
const parse = <T>(file: string, schema: z.ZodType<T>): T | null => {
  const result = schema.safeParse(read(file));
  if (result.success) return result.data;
  for (const issue of result.error.issues)
    errors.push(`${file}.${issue.path.join('.')}: ${issue.message}`);
  return null;
};
const unique = <T extends { id: string }>(
  file: string,
  records: readonly T[],
) => {
  const ids = new Set<string>();
  for (const { id } of records) {
    if (ids.has(id)) errors.push(`${file}: ID duplicado "${id}"`);
    ids.add(id);
  }
};
const collection = <T extends { id: string }>(
  file: string,
  schema: z.ZodType<T>,
): T[] => {
  const records = parse(file, z.array(schema)) ?? [];
  unique(file, records);
  return records;
};
parse('school.yaml', School);
const segments = collection('segments.yaml', Segment);
const activities = collection('activities.yaml', Activity);
const approvals = collection('approvals.yaml', Approval);
const environments = collection('environments.yaml', Environment);
const media = collection('media.yaml', Media);
const banners = collection('seasonal-banners.yaml', SeasonalBanner);
collection('faqs.yaml', FAQ);
if (banners.filter((banner) => banner.active).length > 1)
  errors.push('seasonal-banners.yaml: mantenha apenas um banner ativo');

const mediaIds = new Set(media.map((item) => item.id));
const reference = (label: string, id: string | null) => {
  if (id !== null && !mediaIds.has(id))
    errors.push(`${label}: mídia "${id}" não existe em media.yaml`);
};
for (const item of segments)
  reference(`segments.yaml [${item.id}].imageId`, item.imageId);
for (const item of activities)
  reference(`activities.yaml [${item.id}].imageId`, item.imageId);
for (const item of approvals)
  reference(`approvals.yaml [${item.id}].portraitId`, item.portraitId);
for (const item of environments)
  for (const id of item.images)
    reference(`environments.yaml [${item.id}].images`, id);

const pages = fs
  .readdirSync(path.join(root, 'pages'))
  .filter((file) => /\.ya?ml$/.test(file));
for (const file of pages) {
  const page = parse(
    `pages/${file}`,
    file === 'home.yaml' ? HomePageCopy : PageCopy,
  );
  if (page && page.id !== path.basename(file, path.extname(file)))
    errors.push(`pages/${file}.id: deve corresponder ao nome do arquivo`);
}
const home = parse('pages/home.yaml', HomePageCopy);
if (home) reference('pages/home.yaml.heroImageId', home.heroImageId);

const albumDir = path.join(root, 'albums');
const albums = fs.existsSync(albumDir)
  ? fs
      .readdirSync(albumDir)
      .filter((file) => /\.ya?ml$/.test(file))
      .flatMap((file) => {
        const album = parse(`albums/${file}`, Album);
        return album ? [album] : [];
      })
  : [];
unique('albums', albums);
for (const records of [activities, albums]) {
  const slugs = new Set<string>();
  for (const { id, slug } of records) {
    if (slugs.has(slug)) errors.push(`${id}: slug duplicado "${slug}"`);
    slugs.add(slug);
  }
}
for (const album of albums) {
  reference(`albums [${album.id}].coverId`, album.coverId);
  if (!album.photoIds.includes(album.coverId))
    errors.push(`albums [${album.id}].coverId: deve estar em photoIds`);
  for (const id of album.photoIds)
    reference(`albums [${album.id}].photoIds`, id);
}

const publicRoot = path.resolve('public');
for (const item of media) {
  const file = path.resolve(publicRoot, item.src.replace(/^\//, ''));
  if (!file.startsWith(`${publicRoot}${path.sep}`)) {
    errors.push(`media.yaml [${item.id}].src: caminho fora de public/`);
    continue;
  }
  if (!fs.existsSync(file)) {
    errors.push(
      `media.yaml [${item.id}].src: arquivo "${item.src}" não existe`,
    );
    continue;
  }
  try {
    const { width, height } = await sharp(file).metadata();
    if (width !== item.width || height !== item.height)
      errors.push(
        `media.yaml [${item.id}]: dimensões ${item.width}x${item.height} diferem do arquivo ${width}x${height}`,
      );
  } catch {
    errors.push(`media.yaml [${item.id}].src: imagem ilegível`);
  }
}
if (!fs.existsSync(path.join(root, 'privacidade.md')))
  errors.push('privacidade.md: arquivo ausente');

if (errors.length) {
  console.error(
    `Falha na validação de conteúdo:\n${errors.map((error) => `- ${error}`).join('\n')}`,
  );
  process.exit(1);
}
console.log(
  'Conteúdo válido: formatos, IDs, referências e dimensões de imagens conferidos.',
);
