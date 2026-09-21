/** Resolve somente interesses presentes no catálogo projetado para a página. */
export type InterestOption = { slug: string; name: string };

const SEGMENT_SLUGS = [
  'educacao-infantil',
  'fundamental-anos-iniciais',
  'fundamental-anos-finais',
  'ensino-medio',
] as const;

type ResolvedInterest = {
  slug: string;
  humanName: string;
};

export const resolveInterest = (
  query: URLSearchParams | string | null | undefined,
  segments: readonly InterestOption[],
  activities: readonly InterestOption[],
): ResolvedInterest | null => {
  // A URL completa preserva duplicados, inclusive valores iguais ou vazios.
  // Strings continuam aceitas para consumidores que já tenham um valor isolado.
  const values =
    query instanceof URLSearchParams ? query.getAll('interesse') : [query];
  if (values.length !== 1) return null;
  const value = values[0];
  if (!value || value.trim() === '') return null;

  const raw = value.trim();

  // Check segment slugs (exact match)
  if ((SEGMENT_SLUGS as readonly string[]).includes(raw)) {
    const seg = segments.find((s) => s.slug === raw);
    if (seg) return { slug: raw, humanName: seg.name };
    return null;
  }

  // Check activity slugs (prefix "atividade-")
  const activityPrefix = 'atividade-';
  if (raw.startsWith(activityPrefix)) {
    const actSlug = raw.slice(activityPrefix.length);
    if (actSlug === '') return null;
    const act = activities.find((a) => a.slug === actSlug);
    if (act) return { slug: raw, humanName: act.name };
    return null;
  }

  // Unknown format
  return null;
};
