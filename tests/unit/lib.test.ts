import { describe, expect, it } from 'vitest';
import { formatCivilDate } from '../../src/lib/dates';
import { telUrl, whatsappUrl, formatPhone } from '../../src/lib/urls';
import { projectVisible, project } from '../../src/lib/content';
import { getPublicSchool } from '../../src/lib/content/school';
import { resolveInterest } from '../../src/lib/interest';

describe('utilitários públicos', () => {
  it('formata data civil sem fuso', () =>
    expect(formatCivilDate('2025-03-10')).toBe('10 de março de 2025'));

  it('cria contatos brasileiros', () => {
    expect(telUrl('+5581982177132')).toBe('tel:+5581982177132');
    expect(whatsappUrl('+5581982177132')).toContain(
      'wa.me/5581982177132?text=',
    );
    expect(formatPhone('+5581982177132')).toBe('(81) 98217-7132');
  });

  it('filtra e projeta sem review', () => {
    const values = [
      { id: 'a', review: { status: 'approved' } },
      { id: 'b', review: { status: 'observed' } },
      { id: 'c', review: { status: 'draft' } },
    ];
    expect(projectVisible(values)).toEqual([{ id: 'a' }]);
    expect(project(values[0]!)).not.toHaveProperty('review');
  });
});

describe('getPublicSchool — projeção pública', () => {
  it('devolve tipo flat sem campos review/source/reviewedBy', () => {
    const school = getPublicSchool();
    const json = JSON.stringify(school);
    expect(json).not.toContain('"review"');
    expect(json).not.toContain('"source"');
    expect(json).not.toContain('"reviewedAt"');
    expect(json).not.toContain('"reviewedBy"');
    expect(json).not.toContain('"status"');
  });

  it('campos editorial são null ou valor string (flat)', () => {
    const school = getPublicSchool();
    expect(typeof school.name === 'string' || school.name === null).toBe(true);
    expect(typeof school.tagline === 'string' || school.tagline === null).toBe(
      true,
    );
    expect(
      typeof school.phoneE164 === 'string' || school.phoneE164 === null,
    ).toBe(true);
    expect(
      typeof school.whatsappE164 === 'string' || school.whatsappE164 === null,
    ).toBe(true);
    expect(
      typeof school.locality === 'string' || school.locality === null,
    ).toBe(true);
    expect(typeof school.mapUrl === 'string' || school.mapUrl === null).toBe(
      true,
    );
    expect(
      typeof school.officeHours === 'string' || school.officeHours === null,
    ).toBe(true);
    expect(
      typeof school.instagramUrl === 'string' || school.instagramUrl === null,
    ).toBe(true);
    if (school.address !== null) {
      expect(typeof school.address.street).toBe('string');
      expect(typeof school.address.city).toBe('string');
      expect(typeof school.address.state).toBe('string');
      expect(typeof school.address.neighborhood).toBe('string');
    }
  });

  it('sem review aninhado em nenhum nível do objeto', () => {
    const school = getPublicSchool();
    const assertNoReview = (obj: unknown, path: string) => {
      if (obj === null || typeof obj !== 'object') return;
      for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
        expect(
          ['review', 'source', 'reviewedAt', 'reviewedBy', 'status'].includes(
            key,
          ),
          `campo indesejado "${key}" encontrado em ${path}.${key}`,
        ).toBe(false);
        assertNoReview(val, `${path}.${key}`);
      }
    };
    assertNoReview(school, 'root');
  });
});

describe('formatCivilDate — imunidade a fuso horário', () => {
  it('ignora TZ hostil e mantém resultado string-based', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'Pacific/Kiritimati';
    try {
      const result = formatCivilDate('2025-06-15');
      expect(result).toBe('15 de junho de 2025');
    } finally {
      if (originalTZ === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTZ;
      }
    }
  });

  it('produz mesmo resultado em UTC', () => {
    const result = formatCivilDate('2025-12-31');
    expect(result).toBe('31 de dezembro de 2025');
  });
});

describe('resolveInterest — validação de query', () => {
  const segments = [
    { slug: 'educacao-infantil', name: 'Educação Infantil' },
    {
      slug: 'fundamental-anos-iniciais',
      name: 'Ensino Fundamental — Anos Iniciais',
    },
    {
      slug: 'fundamental-anos-finais',
      name: 'Ensino Fundamental — Anos Finais',
    },
    { slug: 'ensino-medio', name: 'Ensino Médio' },
  ];
  const activities = [
    { slug: 'natacao', name: 'Natação' },
    { slug: 'gimastica', name: 'Ginástica' },
  ];

  it('resolve slug de etapa válido', () => {
    const result = resolveInterest('ensino-medio', segments, activities);
    expect(result).toEqual({ slug: 'ensino-medio', humanName: 'Ensino Médio' });
  });

  it('resolve atividade com prefixo atividade-', () => {
    const result = resolveInterest('atividade-natacao', segments, activities);
    expect(result).toEqual({ slug: 'atividade-natacao', humanName: 'Natação' });
  });

  it('retorna null para query desconhecida', () => {
    expect(resolveInterest('desconhecido', segments, activities)).toBeNull();
  });

  it('retorna null para atividade com slug vazio', () => {
    expect(resolveInterest('atividade-', segments, activities)).toBeNull();
  });

  it('retorna null para query vazia', () => {
    expect(resolveInterest('', segments, activities)).toBeNull();
  });

  it('retorna null para null', () => {
    expect(resolveInterest(null, segments, activities)).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(resolveInterest(undefined, segments, activities)).toBeNull();
  });

  it('retorna null para atividade slug inexistente', () => {
    expect(
      resolveInterest('atividade-inexistente', segments, activities),
    ).toBeNull();
  });

  it('retorna null para whitespace-only', () => {
    expect(resolveInterest('   ', segments, activities)).toBeNull();
  });

  it('faz trim da query', () => {
    const result = resolveInterest('  ensino-medio  ', segments, activities);
    expect(result).toEqual({ slug: 'ensino-medio', humanName: 'Ensino Médio' });
  });
});
