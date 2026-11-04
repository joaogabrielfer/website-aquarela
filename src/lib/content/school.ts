import { z } from 'zod';
import { loadYaml } from './index';
import { School } from './schemas';

export type PublicSchool = z.infer<typeof School>;
export const getPublicSchool = (): PublicSchool =>
  School.parse(loadYaml('school.yaml'));
