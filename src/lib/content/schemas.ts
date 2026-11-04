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
});
export const School = z.object({
  name: z.string(),
  tagline: z.string(),
  phoneE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .nullable(),
  whatsappE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .nullable(),
  locality: z.string(),
  address: z
    .object({
      street: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string().length(2),
      number: optionalText,
      postalCode: optionalText,
    })
    .nullable(),
  mapUrl: httpsUrl.nullable(),
  officeHours: optionalText,
  instagramUrl: httpsUrl,
});
export const PageCopy = z.object({
  id: slug,
  title: z.string(),
  intro: optionalText,
  metaDescription: z.string(),
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
    tone: z.enum(['paper', 'red', 'navy', 'purple']),
    ctaLabel: optionalText,
    href: z
      .string()
      .regex(
        /^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*(?:#[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*)?$/,
      )
      .nullable(),
    active: z.boolean(),
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
});
export const Environment = z.object({
  id,
  name: z.string(),
  purpose: z.string(),
  images: z.array(z.string()),
  accessInfo: optionalText,
  order: z.number(),
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
});
export const Approval = z.object({
  id,
  personId: id.nullable().default(null),
  displayName: z.string(),
  course: z.string(),
  institution: z.string(),
  selectionProcess: z.string(),
  year: z.number().int(),
  portraitId: z.string().nullable(),
  featured: z.boolean(),
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
});
export const FAQ = z.object({
  id,
  group: z.enum(['ensino', 'atividades', 'visita']),
  question: z.string(),
  answer: z.string(),
  order: z.number().int(),
});
export type PublicMedia = z.infer<typeof Media>;
