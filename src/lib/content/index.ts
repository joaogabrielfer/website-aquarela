import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { groupApprovalPeople, type ApprovalPerson } from '../approval-groups';
import { segmentSkeleton, type SegmentSkeleton } from '../segments';
import {
  Activity,
  Approval,
  Environment,
  Segment,
  PageCopy,
  HomePageCopy,
  SeasonalBanner,
  Album,
  FAQ,
  Media,
} from './schemas';

export const contentRoot = path.resolve('content');
export const loadYaml = (file: string): unknown =>
  yaml.load(fs.readFileSync(path.join(contentRoot, file), 'utf8'));

const collection = <T>(file: string, schema: z.ZodType<T>): T[] =>
  z.array(schema).parse(loadYaml(file));

export type { PublicMedia } from './schemas';
export type PublicSegment = SegmentSkeleton & {
  summary: string | null;
  description: string | null;
  grades: string | null;
  ages: string | null;
  shifts: string[];
  experiences: string[];
  imageId: string | null;
};
export type PublicActivity = z.infer<typeof Activity>;
export type PublicApproval = z.infer<typeof Approval>;
export type PublicAlbum = z.infer<typeof Album>;
export type PublicEnvironment = z.infer<typeof Environment>;
export type PublicPageCopy = z.infer<typeof PageCopy>;
export type PublicHomePageCopy = z.infer<typeof HomePageCopy>;
export type PublicSeasonalBanner = z.infer<typeof SeasonalBanner>;
export type PublicFAQ = z.infer<typeof FAQ>;

export const getMediaById = (id: string) =>
  collection('media.yaml', Media).find((media) => media.id === id) ?? null;

export const getSegments = (): PublicSegment[] => {
  const segments = collection('segments.yaml', Segment);
  return segmentSkeleton.map((skeleton) => {
    const segment = segments.find(
      (item) => item.id === skeleton.id && item.slug === skeleton.slug,
    );
    return {
      summary: null,
      description: null,
      grades: null,
      ages: null,
      shifts: [],
      experiences: [],
      ...segment,
      ...skeleton,
      imageId:
        segment?.imageId && getMediaById(segment.imageId)
          ? segment.imageId
          : null,
    };
  });
};

export const getActivities = (): PublicActivity[] =>
  collection('activities.yaml', Activity).sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  );

export const getFeaturedActivities = (limit = 3): PublicActivity[] =>
  getActivities()
    .filter((activity) => activity.featured)
    .slice(0, limit);

export const getApprovals = (): PublicApproval[] =>
  collection('approvals.yaml', Approval)
    .sort(
      (a, b) =>
        b.year - a.year ||
        a.displayName.localeCompare(b.displayName, 'pt-BR') ||
        a.id.localeCompare(b.id),
    )
    .map((approval) => ({
      ...approval,
      portraitId:
        approval.portraitId && getMediaById(approval.portraitId)
          ? approval.portraitId
          : null,
    }));

export type ApprovalGroup = { year: number; items: ApprovalPerson[] };
export const getApprovalsGrouped = (): ApprovalGroup[] => {
  const groups = new Map<number, ApprovalPerson[]>();
  for (const person of groupApprovalPeople(getApprovals())) {
    const items = groups.get(person.year) ?? [];
    items.push(person);
    groups.set(person.year, items);
  }
  return [...groups]
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
};

export const getFeaturedApprovals = (limit = 3): PublicApproval[] =>
  getApprovals()
    .filter((approval) => approval.featured)
    .slice(0, limit);

export const getFeaturedApprovalPeople = (limit = 3): ApprovalPerson[] =>
  groupApprovalPeople(
    getApprovals().filter((approval) => approval.featured),
  ).slice(0, limit);

export const getAlbums = (): PublicAlbum[] => {
  const directory = path.join(contentRoot, 'albums');
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => Album.parse(loadYaml(`albums/${file}`)))
    .filter(
      (album) =>
        album.photoIds.includes(album.coverId) && getMediaById(album.coverId),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
};

export const getAlbum = (slug: string): PublicAlbum | null =>
  getAlbums().find((album) => album.slug === slug) ?? null;

export const getAlbumPhotos = (slug: string) =>
  (getAlbum(slug)?.photoIds ?? [])
    .map(getMediaById)
    .filter((media) => media !== null);

export const getEnvironments = (): PublicEnvironment[] =>
  collection('environments.yaml', Environment)
    .filter((environment) => environment.images.some((id) => getMediaById(id)))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export const getEnvironmentPhotos = () =>
  [...new Set(getEnvironments().flatMap((environment) => environment.images))]
    .map(getMediaById)
    .filter((media) => media !== null);

export const getPageCopy = (id: string): PublicPageCopy | null => {
  const file = `pages/${id}.yaml`;
  if (!fs.existsSync(path.join(contentRoot, file))) return null;
  return (id === 'home' ? HomePageCopy : PageCopy).parse(loadYaml(file));
};

export const getHomePageCopy = (): PublicHomePageCopy | null =>
  getPageCopy('home') as PublicHomePageCopy | null;

export const getSeasonalBanners = (): PublicSeasonalBanner[] =>
  collection('seasonal-banners.yaml', SeasonalBanner)
    .filter((banner) => banner.active)
    .slice(0, 1);

export const getFaqs = (
  group: 'ensino' | 'atividades' | 'visita',
): PublicFAQ[] =>
  collection('faqs.yaml', FAQ)
    .filter((faq) => faq.group === group)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export type PrivacyDoc = { body: string };
export const getPrivacyDoc = (): PrivacyDoc => ({
  body: fs
    .readFileSync(path.join(contentRoot, 'privacidade.md'), 'utf8')
    .trim(),
});
