/**
 * Esqueleto dos quatro segmentos de ensino.
 * Parte da arquitetura (D04): os títulos e slugs são fixos independentemente
 * de dados editoriais. Os campos de conteúdo (summary, description, etc.)
 * vêm de segments.yaml e são enriquecidos apenas quando visíveis no modo.
 */

export type SegmentSkeleton = {
  id: string;
  slug: string;
  name: string;
  order: number;
};

export const segmentSkeleton: SegmentSkeleton[] = [
  {
    id: 'educacao-infantil',
    slug: 'educacao-infantil',
    name: 'Educação Infantil',
    order: 1,
  },
  {
    id: 'fundamental-anos-iniciais',
    slug: 'fundamental-anos-iniciais',
    name: 'Ensino Fundamental — Anos Iniciais',
    order: 2,
  },
  {
    id: 'fundamental-anos-finais',
    slug: 'fundamental-anos-finais',
    name: 'Ensino Fundamental — Anos Finais',
    order: 3,
  },
  {
    id: 'ensino-medio',
    slug: 'ensino-medio',
    name: 'Ensino Médio',
    order: 4,
  },
];
