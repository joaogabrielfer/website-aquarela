import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import { BUILD_MODE } from '../env';
import { segmentSkeleton, type SegmentSkeleton } from '../segments';
import {
  Activity as ActivitySchema,
  Approval as ApprovalSchema,
  Environment as EnvironmentSchema,
  Segment as SegmentSchema,
  PageCopy as PageCopySchema,
  HomePageCopy as HomePageCopySchema,
  SeasonalBanner as SeasonalBannerSchema,
  Album as AlbumSchema,
  FAQ as FAQSchema,
  Media as MediaSchema,
  PrivacyFrontmatter,
} from './schemas';

/* ------------------------------------------------------------------ */
/*  Infraestrutura de carregamento                                    */
/* ------------------------------------------------------------------ */

export const contentRoot = path.resolve('content');

export const loadYaml = (file: string) =>
  yaml.load(fs.readFileSync(path.join(contentRoot, file), 'utf8')) as unknown;

/** Carrega todos os arquivos YAML de um diretório. */
const loadYamlDir = (dir: string): unknown[] => {
  const dirPath = path.join(contentRoot, dir);
  if (!fs.existsSync(dirPath)) return [];
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const results: unknown[] = [];
  for (const file of files) {
    const raw = yaml.load(
      fs.readFileSync(path.join(dirPath, file), 'utf8'),
    ) as unknown;
    if (raw !== null && raw !== undefined) results.push(raw);
  }
  return results;
};

export const isVisible = (review: { status: string }) =>
  BUILD_MODE === 'editorial-preview'
    ? ['approved', 'observed', 'draft'].includes(review.status)
    : review.status === 'approved';

export type PublicProjection<T> = Omit<
  T,
  'review' | 'usageApproved' | 'publicationAuthorized'
>;

/** Projeta somente campos seguros para o browser. */
export const project = <T extends { review: unknown }>(
  value: T,
): PublicProjection<T> => {
  const projected = { ...value } as T & {
    review?: unknown;
    usageApproved?: unknown;
    publicationAuthorized?: unknown;
  };
  delete projected.review;
  delete projected.usageApproved;
  delete projected.publicationAuthorized;
  return projected as PublicProjection<T>;
};

export const projectVisible = <T extends { review: { status: string } }>(
  values: T[],
) => values.filter((v) => isVisible(v.review)).map(project);

/* ------------------------------------------------------------------ */
/*  Tipos públicos                                                    */
/* ------------------------------------------------------------------ */

import type { z } from 'zod';
import type { PublicMedia } from './schemas';

export type { PublicMedia };

export type PublicSegment = SegmentSkeleton & {
  summary: string | null;
  description: string | null;
  grades: string | null;
  ages: string | null;
  shifts: string[];
  experiences: string[];
  imageId: string | null;
};

export type PublicActivity = Omit<z.infer<typeof ActivitySchema>, 'review'>;
export type PublicApproval = Omit<
  z.infer<typeof ApprovalSchema>,
  'review' | 'publicationAuthorized'
>;
export type PublicAlbum = Omit<z.infer<typeof AlbumSchema>, 'review'>;
export type PublicEnvironment = Omit<
  z.infer<typeof EnvironmentSchema>,
  'review'
>;
export type PublicPageCopy = Omit<z.infer<typeof PageCopySchema>, 'review'>;
export type PublicHomePageCopy = Omit<
  z.infer<typeof HomePageCopySchema>,
  'review'
>;
export type PublicSeasonalBanner = Omit<
  z.infer<typeof SeasonalBannerSchema>,
  'review'
>;
export type PublicFAQ = Omit<z.infer<typeof FAQSchema>, 'review'>;

/* ------------------------------------------------------------------ */
/*  Media helpers                                                     */
/* ------------------------------------------------------------------ */

const loadMedia = (): z.infer<typeof MediaSchema>[] => {
  const raw = loadYaml('media.yaml') as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => MediaSchema.parse(m));
};

/** Busca mídia por ID — visível + usageApproved. */
export const getMediaById = (id: string): PublicMedia | null => {
  const all = loadMedia();
  const found = all.find(
    (m) => m.id === id && isVisible(m.review) && m.usageApproved,
  );
  return found ? project(found) : null;
};

/* ------------------------------------------------------------------ */
/*  Segmentos (esqueleto + merge editorial)                           */
/* ------------------------------------------------------------------ */

export const getSegments = (): PublicSegment[] => {
  const raw = loadYaml('segments.yaml') as unknown;
  const editorial: z.infer<typeof SegmentSchema>[] = Array.isArray(raw)
    ? raw.map((s) => SegmentSchema.parse(s))
    : [];
  const mediaAll = loadMedia();

  return segmentSkeleton.map((sk) => {
    const ed = editorial.find((e) => e.id === sk.id && e.slug === sk.slug);
    if (!ed || !isVisible(ed.review)) {
      return {
        ...sk,
        summary: null,
        description: null,
        grades: null,
        ages: null,
        shifts: [],
        experiences: [],
        imageId: null,
      };
    }
    return {
      ...sk,
      summary: ed.summary,
      description: ed.description,
      grades: ed.grades,
      ages: ed.ages,
      shifts: ed.shifts,
      experiences: ed.experiences,
      imageId:
        ed.imageId !== null &&
        mediaAll.some(
          (media) =>
            media.id === ed.imageId &&
            isVisible(media.review) &&
            media.usageApproved,
        )
          ? ed.imageId
          : null,
    };
  });
};

/* ------------------------------------------------------------------ */
/*  Atividades                                                        */
/* ------------------------------------------------------------------ */

export const getActivities = (): PublicActivity[] => {
  const raw = loadYaml('activities.yaml') as unknown;
  if (!Array.isArray(raw)) return [];
  const all = raw.map((a) => ActivitySchema.parse(a));
  return all
    .filter((a) => isVisible(a.review))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map(project);
};

export const getFeaturedActivities = (limit = 3): PublicActivity[] => {
  return getActivities()
    .filter((a) => a.featured)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .slice(0, limit);
};

/* ------------------------------------------------------------------ */
/*  Aprovações                                                        */
/* ------------------------------------------------------------------ */

export type ApprovalGroup = {
  year: number;
  items: PublicApproval[];
};

export const getApprovals = (): PublicApproval[] => {
  const raw = loadYaml('approvals.yaml') as unknown;
  if (!Array.isArray(raw)) return [];
  const all = raw.map((a) => ApprovalSchema.parse(a));
  return all
    .filter((a) => isVisible(a.review) && a.publicationAuthorized)
    .sort(
      (a, b) =>
        b.year - a.year ||
        a.displayName.localeCompare(b.displayName, 'pt-BR') ||
        a.id.localeCompare(b.id),
    )
    .map(project);
};

export const getApprovalsGrouped = (): ApprovalGroup[] => {
  const approvals = getApprovals();
  const grouped = new Map<number, PublicApproval[]>();
  for (const a of approvals) {
    const existing = grouped.get(a.year) ?? [];
    existing.push(a);
    grouped.set(a.year, existing);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
};

export const getFeaturedApprovals = (limit = 3): PublicApproval[] => {
  return getApprovals()
    .filter((a) => a.featured)
    .slice(0, limit);
};

/* ------------------------------------------------------------------ */
/*  Álbuns                                                            */
/* ------------------------------------------------------------------ */

const loadAlbumRaw = (): z.infer<typeof AlbumSchema>[] => {
  const entries = loadYamlDir('albums');
  return entries.map((e) => AlbumSchema.parse(e));
};

const albumHasApprovedPhoto = (
  album: z.infer<typeof AlbumSchema>,
  mediaAll: z.infer<typeof MediaSchema>[],
): boolean => {
  const cover = mediaAll.find((media) => media.id === album.coverId);
  return (
    album.photoIds.includes(album.coverId) &&
    cover !== undefined &&
    isVisible(cover.review) &&
    cover.usageApproved &&
    album.photoIds.some((pid) => {
      const media = mediaAll.find((item) => item.id === pid);
      return (
        media !== undefined && isVisible(media.review) && media.usageApproved
      );
    })
  );
};

export const getAlbums = (): PublicAlbum[] => {
  const all = loadAlbumRaw();
  const mediaAll = loadMedia();
  return all
    .filter((a) => isVisible(a.review) && albumHasApprovedPhoto(a, mediaAll))
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
    .map(project);
};

export const getAlbum = (slug: string): PublicAlbum | null => {
  const albums = getAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
};

/** Retorna fotos publicáveis de um álbum (filter + project). */
export const getAlbumPhotos = (slug: string): PublicMedia[] => {
  const raw = loadAlbumRaw();
  const album = raw.find(
    (a) =>
      a.slug === slug &&
      isVisible(a.review) &&
      albumHasApprovedPhoto(a, loadMedia()),
  );
  if (!album) return [];
  const mediaAll = loadMedia();
  return album.photoIds
    .map((pid) => {
      const m = mediaAll.find((mm) => mm.id === pid);
      return m && isVisible(m.review) && m.usageApproved ? project(m) : null;
    })
    .filter((p): p is PublicMedia => p !== null);
};

/* ------------------------------------------------------------------ */
/*  Ambientes                                                         */
/* ------------------------------------------------------------------ */

export const getEnvironments = (): PublicEnvironment[] => {
  const raw = loadYaml('environments.yaml') as unknown;
  if (!Array.isArray(raw)) return [];
  const all = raw.map((e) => EnvironmentSchema.parse(e));
  const mediaAll = loadMedia();
  return all
    .filter(
      (environment) =>
        isVisible(environment.review) &&
        environment.images.some((imageId) => {
          const media = mediaAll.find((item) => item.id === imageId);
          return (
            media !== undefined &&
            isVisible(media.review) &&
            media.usageApproved
          );
        }),
    )
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map(project);
};

/** Concatenação de fotos dos ambientes na ordem editorial, sem duplicar. */
export const getEnvironmentPhotos = (): PublicMedia[] => {
  const environments = getEnvironments();
  const mediaAll = loadMedia();
  const seen = new Set<string>();
  const photos: PublicMedia[] = [];
  for (const env of environments) {
    for (const imgId of env.images) {
      if (seen.has(imgId)) continue;
      seen.add(imgId);
      const m = mediaAll.find((mm) => mm.id === imgId);
      if (m && isVisible(m.review) && m.usageApproved) {
        photos.push(project(m));
      }
    }
  }
  return photos;
};

/* ------------------------------------------------------------------ */
/*  PageCopy                                                          */
/* ------------------------------------------------------------------ */

export const getPageCopy = (id: string): PublicPageCopy | null => {
  try {
    const raw = loadYaml(`pages/${id}.yaml`) as unknown;
    if (!raw) return null;
    const parsed = (id === 'home' ? HomePageCopySchema : PageCopySchema).parse(
      raw,
    );
    if (!isVisible(parsed.review)) return null;
    return project(parsed);
  } catch {
    return null;
  }
};

/** Copy da home, incluindo a referência editorial opcional do Hero. */
export const getHomePageCopy = (): PublicHomePageCopy | null => {
  const copy = getPageCopy('home');
  return copy as PublicHomePageCopy | null;
};

/** Banners ativos, limitados a um por chamada e projetados sem metadados. */
export const getSeasonalBanners = (): PublicSeasonalBanner[] => {
  const raw = loadYaml('seasonal-banners.yaml') as unknown;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => SeasonalBannerSchema.parse(entry))
    .filter((banner) => banner.active && isVisible(banner.review))
    .slice(0, 1)
    .map(project);
};

/* ------------------------------------------------------------------ */
/*  FAQ                                                               */
/* ------------------------------------------------------------------ */

export const getFaqs = (
  group: 'ensino' | 'atividades' | 'visita',
): PublicFAQ[] => {
  const raw = loadYaml('faqs.yaml') as unknown;
  if (!Array.isArray(raw)) return [];
  const all = raw.map((f) => FAQSchema.parse(f));
  return all
    .filter((f) => f.group === group && isVisible(f.review))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map(project);
};

/* ------------------------------------------------------------------ */
/*  Privacidade                                                       */
/* ------------------------------------------------------------------ */

export type PrivacyDoc = {
  body: string;
};

export const getPrivacyDoc = (): PrivacyDoc => {
  const raw = fs.readFileSync(path.join(contentRoot, 'privacidade.md'), 'utf8');
  // Frontmatter: ---\n...\n---\n
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { body: '' };
  }
  const frontmatter = yaml.load(match[1]!);
  const parsed = PrivacyFrontmatter.safeParse(frontmatter);
  if (!parsed.success || !isVisible(parsed.data.review)) {
    return { body: '' };
  }
  const body = (match[2] ?? '').trim();
  return { body };
};
