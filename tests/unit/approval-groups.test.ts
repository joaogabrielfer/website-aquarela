import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { groupApprovalPeople } from '../../src/lib/approval-groups';
import {
  getApprovalsGrouped,
  getFeaturedApprovalPeople,
  type PublicApproval,
} from '../../src/lib/content';

const result = (overrides: Partial<PublicApproval> = {}): PublicApproval => ({
  id: 'qa-conquista-a',
  personId: 'qa-pessoa',
  displayName: 'Pessoa sintética de QA',
  course: 'Curso sintético A',
  institution: 'Instituição sintética',
  selectionProcess: 'Processo sintético',
  year: 2027,
  portraitId: null,
  featured: false,
  ...overrides,
});

afterEach(() => vi.restoreAllMocks());

describe('conquistas agrupadas por pessoa e ano', () => {
  it('mantém duas conquistas completas e um único retrato no card', () => {
    const records = [
      result({
        id: 'qa-b',
        course: 'Curso sintético B',
        portraitId: 'qa-retrato',
      }),
      result({ id: 'qa-a', course: 'Curso sintético A' }),
    ];
    const cards = groupApprovalPeople(records);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.portraitId).toBe('qa-retrato');
    expect(cards[0]?.achievements.map((item) => item.course)).toEqual([
      'Curso sintético A',
      'Curso sintético B',
    ]);
    expect(cards).toEqual(groupApprovalPeople([...records].reverse()));
    expect(records[0]?.id).toBe('qa-b');
  });

  it('não mistura homônimos, nem agrupa sem identidade explícita', () => {
    const cards = groupApprovalPeople([
      result({ id: 'qa-a', personId: 'qa-pessoa-a' }),
      result({ id: 'qa-b', personId: 'qa-pessoa-b' }),
      result({ id: 'qa-c', personId: null }),
      result({ id: 'qa-d', personId: null }),
    ]);
    expect(cards).toHaveLength(4);
  });

  it('preserva os anos e grafias divergentes sem escolher um nome silenciosamente', () => {
    const cards = groupApprovalPeople([
      result({ id: 'qa-a', displayName: 'Nome sintético A' }),
      result({ id: 'qa-b', displayName: 'Nome sintético B' }),
      result({ id: 'qa-c', year: 2026 }),
    ]);
    expect(cards).toHaveLength(2);
    expect(cards.map((card) => card.year)).toEqual([2027, 2026]);
    expect(cards[0]?.displayName).toBe('Nome sintético A / Nome sintético B');
    expect(cards[0]?.achievements).toHaveLength(2);
  });

  it('destaca até três cards sem acrescentar conquistas não selecionadas', () => {
    const review = {
      status: 'approved',
      source: 'Fixture sintética de QA',
      reviewedAt: '2026-10-30',
      reviewedBy: 'qa-sintetico',
    };
    const records = [
      result({ id: 'qa-a', featured: true }),
      result({ id: 'qa-b', featured: true }),
      result({ id: 'qa-c', featured: false }),
      result({ id: 'qa-d', personId: 'qa-pessoa-2', featured: true }),
      result({ id: 'qa-e', personId: 'qa-pessoa-3', featured: true }),
    ].map((record) => ({ ...record, review, publicationAuthorized: true }));
    const originalRead = fs.readFileSync;
    vi.spyOn(fs, 'readFileSync').mockImplementation((...args) => {
      if (String(args[0]).endsWith('/content/approvals.yaml'))
        return JSON.stringify(records);
      return originalRead(...args);
    });
    const cards = getFeaturedApprovalPeople(3);
    expect(cards).toHaveLength(3);
    expect(cards.flatMap((card) => card.achievements)).toHaveLength(4);
    expect(
      cards.flatMap((card) => card.achievements.map((item) => item.id)),
    ).not.toContain('qa-c');
  });

  it('não colide personId com ID de um registro sem pessoa', () => {
    expect(
      groupApprovalPeople([
        result({ id: 'qa-a', personId: 'qa-b' }),
        result({ id: 'qa-b', personId: null }),
      ]),
    ).toHaveLength(2);
  });

  it('filtra status e autorização antes de agrupar e contar no público', () => {
    const review = {
      status: 'approved',
      source: 'Fixture sintética de QA',
      reviewedAt: '2026-10-30',
      reviewedBy: 'qa-sintetico',
    };
    const records = [
      { ...result({ id: 'qa-publica' }), publicationAuthorized: true, review },
      {
        ...result({ id: 'qa-observada' }),
        publicationAuthorized: true,
        review: { ...review, status: 'observed' },
      },
      {
        ...result({ id: 'qa-sem-permissao' }),
        publicationAuthorized: false,
        review,
      },
    ];
    const originalRead = fs.readFileSync;
    vi.spyOn(fs, 'readFileSync').mockImplementation((...args) => {
      if (String(args[0]).endsWith('/content/approvals.yaml'))
        return JSON.stringify(records);
      return originalRead(...args);
    });
    const groups = getApprovalsGrouped();
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items).toHaveLength(1);
    expect(groups[0]?.items[0]?.achievements.map((item) => item.id)).toEqual([
      'qa-publica',
    ]);
    expect(JSON.stringify(groups)).not.toContain('qa-observada');
    expect(JSON.stringify(groups)).not.toContain('reviewedBy');
  });
});
