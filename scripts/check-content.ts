import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import sharp from 'sharp';
import { z } from 'zod';
import {
  Album,
  Activity,
  Approval,
  Environment,
  FAQ,
  Media,
  PageCopy,
  PrivacyFrontmatter,
  School,
  Segment,
} from '../src/lib/content/schemas.js';

const root = path.resolve('content');
const errors: string[] = [];
const read = (file: string): unknown =>
  yaml.load(fs.readFileSync(path.join(root, file), 'utf8'));

const formatIssues = (error: z.ZodError): string =>
  error.issues
    .map(
      (issue) =>
        `${issue.path.length ? issue.path.join('.') : 'registro'}: ${issue.message}`,
    )
    .join('; ');

const parse = <T>(
  label: string,
  schema: z.ZodType<T>,
  value: unknown,
): T | null => {
  const result = schema.safeParse(value);
  if (!result.success) {
    errors.push(`${label}: ${formatIssues(result.error)}`);
    return null;
  }
  return result.data;
};

const requireApprovedFields = (
  label: string,
  status: string,
  fields: ReadonlyArray<[string, unknown]>,
): void => {
  if (status !== 'approved') return;
  for (const [field, value] of fields) {
    if (
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      value === null ||
      value === undefined
    )
      errors.push(
        `${label}.${field}: obrigatório quando review.status=approved`,
      );
  }
};

const unique = <T extends { id: string }>(
  label: string,
  records: readonly T[],
): void => {
  const ids = new Set<string>();
  for (const [index, record] of records.entries()) {
    if (ids.has(record.id))
      errors.push(`${label}[${index}].id: valor duplicado "${record.id}"`);
    ids.add(record.id);
  }
};

const school = parse('school.yaml', School, read('school.yaml'));
const segments =
  parse('segments.yaml', Segment.array(), read('segments.yaml')) ?? [];
const activities =
  parse('activities.yaml', Activity.array(), read('activities.yaml')) ?? [];
const approvals =
  parse('approvals.yaml', Approval.array(), read('approvals.yaml')) ?? [];
const environments =
  parse('environments.yaml', Environment.array(), read('environments.yaml')) ??
  [];
const media = parse('media.yaml', Media.array(), read('media.yaml')) ?? [];

const pageDir = path.join(root, 'pages');
const pageFiles = fs.existsSync(pageDir)
  ? fs.readdirSync(pageDir).filter((file) => /\.ya?ml$/.test(file))
  : [];
const pages = pageFiles.map((file) => ({
  file,
  value: parse(`pages/${file}`, PageCopy, read(`pages/${file}`)),
}));
const albumDir = path.join(root, 'albums');
const albumFiles = fs.existsSync(albumDir)
  ? fs.readdirSync(albumDir).filter((file) => /\.ya?ml$/.test(file))
  : [];
const albums = albumFiles.flatMap((file) => {
  const value = parse(`albums/${file}`, Album, read(`albums/${file}`));
  return value ? [{ file, value }] : [];
});

if (school) {
  for (const [field, value] of Object.entries(school)) {
    if (value !== null)
      requireApprovedFields(`school.yaml.${field}`, value.review.status, [
        ['value', value.value],
      ]);
  }
}
unique('segments.yaml', segments);
unique('activities.yaml', activities);
unique('approvals.yaml', approvals);
unique('environments.yaml', environments);
unique('media.yaml', media);
unique(
  'albums',
  albums.map(({ value }) => value),
);

const checkSlugs = <T extends { id: string; slug: string }>(
  label: string,
  records: readonly T[],
): void => {
  const slugs = new Set<string>();
  for (const record of records) {
    if (slugs.has(record.slug))
      errors.push(
        `${label} [${record.id}].slug: valor duplicado "${record.slug}"`,
      );
    slugs.add(record.slug);
  }
};
checkSlugs('activities.yaml', activities);
checkSlugs(
  'albums',
  albums.map(({ value }) => value),
);

const mediaIds = new Set(media.map((item) => item.id));
const publicRoot = path.resolve('public');
const eligibleMedia = (ref: string | null): boolean => {
  if (ref === null) return false;
  const item = media.find((candidate) => candidate.id === ref);
  if (!item || item.review.status !== 'approved' || !item.usageApproved)
    return false;
  const filePath = path.resolve(publicRoot, item.src.replace(/^\//, ''));
  return (
    filePath.startsWith(`${publicRoot}${path.sep}`) && fs.existsSync(filePath)
  );
};
const checkMediaRef = (
  label: string,
  field: string,
  ref: string | null,
): void => {
  if (ref !== null && ref.trim() !== '' && !mediaIds.has(ref))
    errors.push(`${label}.${field}: mídia "${ref}" não existe em media.yaml`);
};
for (const item of segments) {
  checkMediaRef(`segments.yaml [${item.id}]`, 'imageId', item.imageId);
  requireApprovedFields(`segments.yaml [${item.id}]`, item.review.status, [
    ['summary', item.summary],
    ['description', item.description],
    ['imageId', item.imageId],
    ['experiences', item.experiences.length >= 2 ? item.experiences : []],
  ]);
  if (item.review.status === 'approved' && !eligibleMedia(item.imageId))
    errors.push(
      `segments.yaml [${item.id}].imageId: mídia approved, usageApproved e arquivo local são obrigatórios`,
    );
}
for (const item of activities) {
  checkMediaRef(`activities.yaml [${item.id}]`, 'imageId', item.imageId);
  requireApprovedFields(`activities.yaml [${item.id}]`, item.review.status, [
    ['summary', item.summary],
    ['description', item.description],
    ['audience', item.audience],
  ]);
}
for (const item of approvals) {
  checkMediaRef(`approvals.yaml [${item.id}]`, 'portraitId', item.portraitId);
  requireApprovedFields(`approvals.yaml [${item.id}]`, item.review.status, [
    ['displayName', item.displayName],
    ['course', item.course],
    ['institution', item.institution],
    ['selectionProcess', item.selectionProcess],
  ]);
  if (item.review.status === 'approved' && !item.publicationAuthorized)
    errors.push(
      `approvals.yaml [${item.id}].publicationAuthorized: true é obrigatório para aprovação pública`,
    );
}
for (const item of environments) {
  for (const imageId of item.images)
    checkMediaRef(`environments.yaml [${item.id}]`, 'images', imageId);
  if (item.review.status === 'approved' && item.images.length === 0)
    errors.push(
      `environments.yaml [${item.id}].images: ao menos uma mídia é obrigatória quando approved`,
    );
  requireApprovedFields(`environments.yaml [${item.id}]`, item.review.status, [
    ['name', item.name],
    ['purpose', item.purpose],
  ]);
  if (
    item.review.status === 'approved' &&
    !item.images.some((imageId) => eligibleMedia(imageId))
  )
    errors.push(
      `environments.yaml [${item.id}].images: ao menos uma mídia elegível é obrigatória quando approved`,
    );
}
for (const { file, value } of albums) {
  if (value.coverId.trim() !== '' && !value.photoIds.includes(value.coverId))
    errors.push(`albums/${file}.coverId: deve estar em photoIds`);
  for (const photoId of value.photoIds)
    if (photoId.trim() !== '')
      checkMediaRef(`albums/${file}`, 'photoIds', photoId);
  if (value.review.status === 'approved') {
    requireApprovedFields(`albums/${file}`, value.review.status, [
      ['title', value.title],
      ['intro', value.intro],
      ['coverId', value.coverId],
      ['photoIds', value.photoIds],
    ]);
    if (!eligibleMedia(value.coverId))
      errors.push(
        `albums/${file}.coverId: capa deve ser mídia approved, usageApproved e arquivo local`,
      );
    if (!value.photoIds.some((photoId) => eligibleMedia(photoId)))
      errors.push(
        `albums/${file}.photoIds: ao menos uma foto elegível é obrigatória quando approved`,
      );
  }
}
for (const { file, value } of pages) {
  if (value && value.id !== path.basename(file, path.extname(file)))
    errors.push(`pages/${file}.id: deve corresponder ao nome do arquivo`);
  if (value)
    requireApprovedFields(`pages/${file}`, value.review.status, [
      ['title', value.title],
      ['metaDescription', value.metaDescription],
    ]);
}

const faqs = parse('faqs.yaml', FAQ.array(), read('faqs.yaml')) ?? [];
unique('faqs.yaml', faqs);
for (const group of ['ensino', 'atividades', 'visita'] as const) {
  if (
    faqs.filter(
      (faq) => faq.group === group && faq.review.status === 'approved',
    ).length > 6
  )
    errors.push(
      `faqs.yaml [${group}]: no máximo 6 perguntas approved por grupo`,
    );
}
for (const faq of faqs)
  requireApprovedFields(`faqs.yaml [${faq.id}]`, faq.review.status, [
    ['question', faq.question],
    ['answer', faq.answer],
  ]);

const privacyPath = path.join(root, 'privacidade.md');
if (fs.existsSync(privacyPath)) {
  const raw = fs.readFileSync(privacyPath, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) errors.push('privacidade.md: frontmatter YAML obrigatório');
  else
    parse(
      'privacidade.md frontmatter',
      PrivacyFrontmatter,
      yaml.load(match[1]!),
    );
} else errors.push('privacidade.md: arquivo obrigatório ausente');

for (const item of media) {
  if (item.review.status === 'approved') {
    requireApprovedFields(`media.yaml [${item.id}]`, item.review.status, [
      ['alt', item.alt],
    ]);
  }
  const filePath = path.resolve(publicRoot, item.src.replace(/^\//, ''));
  if (!filePath.startsWith(`${publicRoot}${path.sep}`)) {
    errors.push(`media.yaml [${item.id}].src: caminho fora de public/`);
    continue;
  }
  if (!fs.existsSync(filePath)) {
    if (item.review.status === 'approved')
      errors.push(
        `media.yaml [${item.id}].src: arquivo "${item.src}" não existe`,
      );
    continue;
  }
  try {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width !== item.width || metadata.height !== item.height)
      errors.push(
        `media.yaml [${item.id}]: dimensões ${item.width}x${item.height} diferem do arquivo ${metadata.width ?? 0}x${metadata.height ?? 0}`,
      );
  } catch {
    errors.push(
      `media.yaml [${item.id}].src: arquivo não é uma imagem legível`,
    );
  }
}

if (errors.length > 0) {
  console.error('Falha na validação de conteúdo:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  'Conteúdo válido: schemas D02-D07 e regras condicionais conferidos.',
);
