/**
 * Resolve a query parameter `interesse` against known segments and activities.
 * Returns a human-readable interest or null for unknown/duplicate/empty values.
 */

type Segment = { slug: string; name: string };
type Activity = { slug: string; name: string };

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
  query: string | null | undefined,
  segments: Segment[],
  activities: Activity[],
): ResolvedInterest | null => {
  if (!query || query.trim() === '') return null;

  const raw = query.trim();

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
