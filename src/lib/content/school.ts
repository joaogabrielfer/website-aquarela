import { z } from 'zod';
import { BUILD_MODE } from '../env';
import { loadYaml } from './index';
import { School } from './schemas';

type EditorialValue<T> = { value: T; review: { status: string } };
type Address = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string | null;
  postalCode: string | null;
};

export type PublicSchool = {
  name: string | null;
  tagline: string | null;
  phoneE164: string | null;
  whatsappE164: string | null;
  locality: string | null;
  address: Address | null;
  mapUrl: string | null;
  officeHours: string | null;
  instagramUrl: string | null;
};

const isEditorialVisible = (e: EditorialValue<unknown>) =>
  BUILD_MODE === 'editorial-preview'
    ? ['approved', 'observed', 'draft'].includes(e.review.status)
    : e.review.status === 'approved';

const resolveEditorial = <T>(e: EditorialValue<T> | null): T | null =>
  e !== null && isEditorialVisible(e) ? e.value : null;

export const getPublicSchool = (): PublicSchool => {
  const raw = loadYaml('school.yaml') as z.infer<typeof School>;
  const school = School.parse(raw);

  return {
    name: resolveEditorial(school.name),
    tagline: resolveEditorial(school.tagline),
    phoneE164: resolveEditorial(school.phoneE164),
    whatsappE164: resolveEditorial(school.whatsappE164),
    locality: resolveEditorial(school.locality),
    address: school.address
      ? isEditorialVisible(school.address)
        ? school.address.value
        : null
      : null,
    mapUrl: resolveEditorial(school.mapUrl),
    officeHours: resolveEditorial(school.officeHours),
    instagramUrl: resolveEditorial(school.instagramUrl),
  };
};
