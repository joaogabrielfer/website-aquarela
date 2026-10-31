import type { PublicApproval } from './content';

export type ApprovalAchievement = Pick<
  PublicApproval,
  'id' | 'course' | 'institution' | 'selectionProcess' | 'year'
>;

export type ApprovalPerson = {
  id: string;
  displayName: string;
  year: number;
  portraitId: string | null;
  achievements: ApprovalAchievement[];
};

/** Recebe apenas resultados já filtrados pelas permissões do modo de build. */
export const groupApprovalPeople = (
  approvals: readonly PublicApproval[],
): ApprovalPerson[] => {
  const groups = new Map<string, PublicApproval[]>();
  for (const approval of approvals) {
    // O namespace impede colisão entre um personId e um ID de conquista.
    const identity = approval.personId
      ? `person:${approval.personId}`
      : `record:${approval.id}`;
    const key = `${approval.year}:${identity}`;
    const records = groups.get(key) ?? [];
    records.push(approval);
    groups.set(key, records);
  }

  return [...groups.entries()]
    .map(([id, records]): ApprovalPerson => {
      const ordered = [...records].sort((a, b) => a.id.localeCompare(b.id));
      const first = ordered[0]!;
      const names = [...new Set(ordered.map((record) => record.displayName))];
      return {
        id,
        displayName: names.join(' / '),
        year: first.year,
        portraitId:
          ordered.find((record) => record.portraitId)?.portraitId ?? null,
        achievements: ordered.map(
          ({ id, course, institution, selectionProcess, year }) => ({
            id,
            course,
            institution,
            selectionProcess,
            year,
          }),
        ),
      };
    })
    .sort(
      (a, b) =>
        b.year - a.year ||
        a.displayName.localeCompare(b.displayName, 'pt-BR') ||
        a.id.localeCompare(b.id),
    );
};
