import { z } from 'zod';

const isCivilDate = (value: string): boolean => {
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year!, month! - 1, day!));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month! - 1 &&
    parsed.getUTCDate() === day
  );
};

const civilDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD')
  .refine(isCivilDate, 'data civil inexistente');
const id = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use ID ASCII minúsculo estável');
const slug = id;
const localMediaPath = z
  .string()
  .min(1)
  .regex(/^\/[A-Za-z0-9._/-]+$/, 'src deve ser caminho local absoluto');
const httpsUrl = z.url({ protocol: /^https$/ });
export const Status = z.enum(['draft', 'observed', 'approved', 'archived']);
export const Review = z
  .object({
    status: Status,
    source: z.string().min(1),
    reviewedAt: civilDate.nullable(),
    reviewedBy: z.string().min(1).nullable(),
  })
  .superRefine((v, c) => {
    if (v.status === 'approved' && (!v.reviewedAt || !v.reviewedBy))
      c.addIssue({
        code: 'custom',
        message: 'approved exige reviewedAt e reviewedBy',
      });
  });
export const Editorial = <T extends z.ZodType>(value: T) =>
  z.object({ value, review: Review });
const optionalText = z.string().nullable();
export const Media = z.object({
  id,
  src: localMediaPath.refine((value) => !value.includes('..'), {
    message: 'src não pode conter travessia de diretório',
  }),
  width: z.number().positive(),
  height: z.number().positive(),
  alt: z.string(),
  caption: optionalText,
  focalPoint: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }),
  review: Review,
  usageApproved: z.boolean(),
});
export const School = z.object({
  name: Editorial(z.string()),
  tagline: Editorial(z.string()),
  phoneE164: Editorial(z.string().regex(/^\+[1-9]\d{7,14}$/)).nullable(),
  whatsappE164: Editorial(z.string().regex(/^\+[1-9]\d{7,14}$/)).nullable(),
  locality: Editorial(z.string()),
  address: Editorial(
    z.object({
      street: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string().length(2),
      number: optionalText,
      postalCode: optionalText,
    }),
  ).nullable(),
  mapUrl: Editorial(httpsUrl).nullable(),
  officeHours: Editorial(z.string()).nullable(),
  instagramUrl: Editorial(httpsUrl),
});
export const PageCopy = z.object({
  id: slug,
  title: z.string(),
  intro: optionalText,
  metaDescription: z.string(),
  review: Review,
});
export const HomePageCopy = PageCopy.extend({
  heroImageId: z.string().nullable(),
});
export const SeasonalBanner = z
  .object({
    id,
    eyebrow: optionalText,
    title: z.string(),
    body: optionalText,
    ctaLabel: optionalText,
    href: z
      .string()
      .regex(
        /^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*(?:#[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*)?$/,
      )
      .nullable(),
    active: z.boolean(),
    review: Review,
  })
  .superRefine((value, ctx) => {
    if ((value.ctaLabel === null) !== (value.href === null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['ctaLabel'],
        message: 'ctaLabel e href devem ser informados juntos ou omitidos',
      });
    }
  });
const baseReview = { review: Review };
export const Segment = z.object({
  id,
  slug: z.enum([
    'educacao-infantil',
    'fundamental-anos-iniciais',
    'fundamental-anos-finais',
    'ensino-medio',
  ]),
  name: z.string(),
  order: z.number(),
  summary: optionalText,
  description: optionalText,
  grades: optionalText,
  ages: optionalText,
  shifts: z.array(z.string()),
  experiences: z.array(z.string()),
  imageId: z.string().nullable(),
  ...baseReview,
});
export const Environment = z.object({
  id,
  name: z.string(),
  purpose: z.string(),
  images: z.array(z.string()),
  accessInfo: optionalText,
  order: z.number(),
  ...baseReview,
});
export const Activity = z.object({
  id,
  slug,
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  audience: z.string(),
  shifts: z.array(z.string()),
  location: optionalText,
  conditions: optionalText,
  imageId: z.string().nullable(),
  order: z.number(),
  featured: z.boolean(),
  ...baseReview,
});
export const Approval = z.object({
  id,
  displayName: z.string(),
  course: z.string(),
  institution: z.string(),
  selectionProcess: z.string(),
  year: z.number().int(),
  portraitId: z.string().nullable(),
  publicationAuthorized: z.boolean(),
  featured: z.boolean(),
  ...baseReview,
});
export const Album = z.object({
  id,
  slug,
  title: z.string(),
  category: z.enum(['Projetos', 'Eventos', 'Cotidiano']),
  date: civilDate,
  intro: z.string(),
  coverId: z.string(),
  photoIds: z.array(z.string()),
  ...baseReview,
});
export const FAQ = z.object({
  id,
  group: z.enum(['ensino', 'atividades', 'visita']),
  question: z.string(),
  answer: z.string(),
  order: z.number().int(),
  ...baseReview,
});
export const PrivacyFrontmatter = z.object({ review: Review });
export const Proposal = z.object({
  intro: z.string(),
  facts: z.tuple([z.string(), z.string(), z.string()]),
  imageId: z.string(),
  review: Review,
});
export type PublicMedia = Omit<
  z.infer<typeof Media>,
  'review' | 'usageApproved'
>;
