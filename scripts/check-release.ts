import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  Media,
  PageCopy,
  PrivacyFrontmatter,
  School,
  Segment,
} from '../src/lib/content/schemas.js';

const root = path.resolve('content');
const read = (file: string): unknown =>
  yaml.load(fs.readFileSync(path.join(root, file), 'utf8'));
const blockers: string[] = [];
const approved = (review: { status: string }): boolean =>
  review.status === 'approved';

// O contrato ainda não possui um campo que ligue uma mídia ao Hero da home.
blockers.push(
  'foto principal da home: referência ao Hero ainda não modelada no contrato',
);

const schoolResult = School.safeParse(read('school.yaml'));
const mediaResult = Media.array().safeParse(read('media.yaml'));
const segmentsResult = Segment.array().safeParse(read('segments.yaml'));
const homeResult = PageCopy.safeParse(read('pages/home.yaml'));
if (!schoolResult.success)
  blockers.push(
    'school.yaml inválido; identidade/localidade não podem ser verificadas',
  );
if (!mediaResult.success)
  blockers.push('media.yaml inválido; mídia elegível não pode ser verificada');
if (!segmentsResult.success)
  blockers.push(
    'segments.yaml inválido; os quatro segmentos não podem ser verificados',
  );
if (!homeResult.success)
  blockers.push(
    'pages/home.yaml inválido; copy principal não pode ser verificada',
  );

if (schoolResult.success) {
  if (
    !approved(schoolResult.data.name.review) ||
    !approved(schoolResult.data.locality.review)
  )
    blockers.push('identidade/localidade não aprovadas');
  const phoneReady =
    schoolResult.data.phoneE164 !== null &&
    approved(schoolResult.data.phoneE164.review);
  const whatsappReady =
    schoolResult.data.whatsappE164 !== null &&
    approved(schoolResult.data.whatsappE164.review);
  if (!phoneReady && !whatsappReady)
    blockers.push('telefone ou WhatsApp aprovado ausente');
}

if (homeResult.success && !approved(homeResult.data.review))
  blockers.push('copy principal da home não aprovada');

const mediaById = new Map(
  mediaResult.success ? mediaResult.data.map((item) => [item.id, item]) : [],
);
const eligibleMedia = (id: string | null): boolean => {
  if (id === null) return false;
  const item = mediaById.get(id);
  if (!item || !approved(item.review) || !item.usageApproved) return false;
  return fs.existsSync(path.resolve('public', item.src.replace(/^\//, '')));
};

const requiredSlugs = [
  'educacao-infantil',
  'fundamental-anos-iniciais',
  'fundamental-anos-finais',
  'ensino-medio',
] as const;
if (segmentsResult.success) {
  const bySlug = new Map(
    segmentsResult.data.map((segment) => [segment.slug, segment]),
  );
  if (
    requiredSlugs.some((slug) => {
      const segment = bySlug.get(slug);
      return (
        !segment ||
        !approved(segment.review) ||
        !segment.summary?.trim() ||
        !segment.description?.trim() ||
        segment.experiences.length < 2 ||
        !eligibleMedia(segment.imageId)
      );
    })
  )
    blockers.push('4 segmentos completos e com mídia elegível ausentes');
}

const privacyPath = path.join(root, 'privacidade.md');
if (!fs.existsSync(privacyPath)) blockers.push('privacidade aprovada ausente');
else {
  const raw = fs.readFileSync(privacyPath, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const result = match
    ? PrivacyFrontmatter.safeParse(yaml.load(match[1]!))
    : null;
  const body = match?.[2] ?? '';
  if (
    !match ||
    !result?.success ||
    !approved(result.data.review) ||
    !body.trim()
  )
    blockers.push('privacidade aprovada ausente');
}

if (process.env.APP_BUILD_MODE === 'editorial-preview') {
  blockers.push('build de release não pode usar editorial-preview');
}
console.error('Bloqueios de lançamento D06:');
for (const blocker of blockers) console.error(`- ${blocker}`);
process.exit(1);
