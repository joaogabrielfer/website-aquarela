import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import {
  getSegments,
  getActivities,
  getFeaturedActivities,
  getApprovals,
  getApprovalsGrouped,
  getFeaturedApprovals,
  getAlbums,
  getEnvironments,
  getEnvironmentPhotos,
  getPageCopy,
  getHomePageCopy,
  getSeasonalBanners,
  getFaqs,
  getPrivacyDoc,
  isVisible,
  project,
} from '../../src/lib/content';
import { renderPrivacyMarkdown } from '../../src/lib/privacy';
import {
  Album,
  HomePageCopy,
  SeasonalBanner,
} from '../../src/lib/content/schemas';

/* ------------------------------------------------------------------ */
/*  isVisible e project (existentes, ampliados)                       */
/* ------------------------------------------------------------------ */

describe('isVisible', () => {
  // BUILD_MODE é avaliado no import do módulo; testamos o comportamento
  // no modo padrão (public)
  it('approved é visível no modo público', () => {
    expect(isVisible({ status: 'approved' })).toBe(true);
  });

  it('observed não é visível no modo público', () => {
    expect(isVisible({ status: 'observed' })).toBe(false);
  });

  it('draft não é visível no modo público', () => {
    expect(isVisible({ status: 'draft' })).toBe(false);
  });

  it('archived nunca é visível', () => {
    expect(isVisible({ status: 'archived' })).toBe(false);
  });
});

describe('project', () => {
  it('remove campo review', () => {
    const item = { id: 'a', name: 'Teste', review: { status: 'approved' } };
    const result = project(item);
    expect(result).toEqual({ id: 'a', name: 'Teste' });
    expect(result).not.toHaveProperty('review');
  });

  it('remove também usageApproved da projeção pública', () => {
    const result = project({
      id: 'foto',
      usageApproved: true,
      review: { status: 'approved' },
    });
    expect(result).toEqual({ id: 'foto' });
    expect(result).not.toHaveProperty('usageApproved');
  });

  it('remove autorização editorial da projeção pública', () => {
    const result = project({
      id: 'resultado',
      publicationAuthorized: true,
      review: { status: 'approved' },
    });
    expect(result).toEqual({ id: 'resultado' });
    expect(result).not.toHaveProperty('publicationAuthorized');
  });
});

/* ------------------------------------------------------------------ */
/*  Segmentos                                                         */
/* ------------------------------------------------------------------ */

describe('getSegments', () => {
  it('retorna 4 segmentos na ordem fixa do esqueleto', () => {
    const segments = getSegments();
    expect(segments).toHaveLength(4);
    expect(segments.map((s) => s.slug)).toEqual([
      'educacao-infantil',
      'fundamental-anos-iniciais',
      'fundamental-anos-finais',
      'ensino-medio',
    ]);
  });

  it('mantém nomes do esqueleto mesmo sem dados editoriais', () => {
    const segments = getSegments();
    expect(segments[0]!.name).toBe('Educação Infantil');
    expect(segments[1]!.name).toBe('Ensino Fundamental — Anos Iniciais');
    expect(segments[2]!.name).toBe('Ensino Fundamental — Anos Finais');
    expect(segments[3]!.name).toBe('Ensino Médio');
  });

  it('campos editoriais são null quando não approved', () => {
    const segments = getSegments();
    // No build público (default), segments são observed → campos null
    for (const seg of segments) {
      expect(seg.summary).toBeNull();
      expect(seg.description).toBeNull();
      expect(seg.imageId).toBeNull();
    }
  });

  it('preserva ordem do esqueleto', () => {
    const segments = getSegments();
    expect(segments[0]!.order).toBe(1);
    expect(segments[1]!.order).toBe(2);
    expect(segments[2]!.order).toBe(3);
    expect(segments[3]!.order).toBe(4);
  });
});

/* ------------------------------------------------------------------ */
/*  Atividades                                                        */
/* ------------------------------------------------------------------ */

describe('getActivities', () => {
  it('retorna array (pode ser vazio no público)', () => {
    const activities = getActivities();
    expect(Array.isArray(activities)).toBe(true);
  });

  it('sem review nos itens projetados', () => {
    const activities = getActivities();
    for (const act of activities) {
      expect(act).not.toHaveProperty('review');
    }
  });
});

describe('getFeaturedActivities', () => {
  it('retorna no máximo o limite especificado', () => {
    const featured = getFeaturedActivities(3);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  it('retorna array vazio sem featured', () => {
    const featured = getFeaturedActivities(3);
    // No build público, activities são observed → nenhuma visível
    expect(featured).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  Aprovações                                                        */
/* ------------------------------------------------------------------ */

describe('getApprovals', () => {
  it('retorna array', () => {
    const approvals = getApprovals();
    expect(Array.isArray(approvals)).toBe(true);
  });

  it('sem review nos itens', () => {
    const approvals = getApprovals();
    for (const a of approvals) {
      expect(a).not.toHaveProperty('review');
    }
  });
});

describe('getApprovalsGrouped', () => {
  it('retorna array de grupos', () => {
    const groups = getApprovalsGrouped();
    expect(Array.isArray(groups)).toBe(true);
    // Cada grupo tem year e items
    for (const g of groups) {
      expect(typeof g.year).toBe('number');
      expect(Array.isArray(g.items)).toBe(true);
    }
  });

  it('grupos ordenados por ano decrescente', () => {
    const groups = getApprovalsGrouped();
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]!.year).toBeLessThanOrEqual(groups[i - 1]!.year);
    }
  });
});

describe('getFeaturedApprovals', () => {
  it('retorna no máximo o limite', () => {
    const featured = getFeaturedApprovals(3);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  it('retorna vazio sem dados approved', () => {
    const featured = getFeaturedApprovals(3);
    expect(featured).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  Álbuns                                                            */
/* ------------------------------------------------------------------ */

describe('getAlbums', () => {
  it('retorna array', () => {
    const albums = getAlbums();
    expect(Array.isArray(albums)).toBe(true);
  });

  it('sem review nos itens', () => {
    const albums = getAlbums();
    for (const a of albums) {
      expect(a).not.toHaveProperty('review');
    }
  });
});

describe('Album — incompleto não publicado', () => {
  it('aceita draft sem fotos para preservar pauta editorial', () => {
    const result = Album.safeParse({
      id: 'album-pendente',
      slug: 'album-pendente',
      title: '',
      category: 'Projetos',
      date: '2025-02-28',
      intro: '',
      coverId: '',
      photoIds: [],
      review: {
        status: 'draft',
        source: 'pauta-interna',
        reviewedAt: null,
        reviewedBy: null,
      },
    });
    expect(result.success).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Ambientes                                                         */
/* ------------------------------------------------------------------ */

describe('getEnvironments', () => {
  it('retorna array', () => {
    const envs = getEnvironments();
    expect(Array.isArray(envs)).toBe(true);
  });
});

describe('getEnvironmentPhotos', () => {
  it('retorna array', () => {
    const photos = getEnvironmentPhotos();
    expect(Array.isArray(photos)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  PageCopy                                                          */
/* ------------------------------------------------------------------ */

describe('getPageCopy', () => {
  it('retorna null para página draft no público', () => {
    const copy = getPageCopy('home');
    // home.yaml é draft → null no build público
    expect(copy).toBeNull();
  });

  it('retorna null para ID inexistente', () => {
    const copy = getPageCopy('inexistente');
    expect(copy).toBeNull();
  });
});

describe('projeção da revisão Home', () => {
  it('não expõe PageCopy draft nem banner draft no público', () => {
    expect(getHomePageCopy()).toBeNull();
    expect(getSeasonalBanners()).toEqual([]);
  });
});

describe('revisão Home 1.1.0', () => {
  const review = {
    status: 'draft' as const,
    source: 'fixture sintética',
    reviewedAt: null,
    reviewedBy: null,
  };

  it('aceita heroImageId nullable no PageCopy especializado', () => {
    expect(
      HomePageCopy.safeParse({
        id: 'home',
        title: 'Demonstração',
        intro: null,
        metaDescription: '',
        heroImageId: null,
        review,
      }).success,
    ).toBe(true);
  });

  it('exige par completo para CTA do SeasonalBanner', () => {
    const base = {
      id: 'aviso',
      eyebrow: null,
      title: 'Aviso',
      body: null,
      tone: 'red',
      active: true,
      review,
    };
    expect(
      SeasonalBanner.safeParse({ ...base, ctaLabel: 'Saiba mais', href: null })
        .success,
    ).toBe(false);
    expect(
      SeasonalBanner.safeParse({
        ...base,
        ctaLabel: 'Saiba mais',
        href: '/visite',
      }).success,
    ).toBe(true);
  });

  it('recusa destino externo ou protocolo inseguro', () => {
    const base = {
      id: 'aviso',
      eyebrow: null,
      title: 'Aviso',
      body: null,
      tone: 'red',
      ctaLabel: 'Abrir',
      active: true,
      review,
    };
    expect(
      SeasonalBanner.safeParse({ ...base, href: 'https://example.com' })
        .success,
    ).toBe(false);
    expect(
      SeasonalBanner.safeParse({
        ...base,
        href: 'javascript:alert(1)',
      }).success,
    ).toBe(false);
  });

  it('limita o tom do SeasonalBanner à paleta autorizada', () => {
    const result = SeasonalBanner.safeParse({
      id: 'aviso',
      eyebrow: null,
      title: 'Aviso',
      body: null,
      tone: 'verde-arbitrario',
      ctaLabel: null,
      href: null,
      active: true,
      review,
    });

    expect(result.success).toBe(false);
  });

  it('mantém saída de release 0 quando não há bloqueios', () => {
    const source = fs.readFileSync('scripts/check-release.ts', 'utf8');
    expect(source).toContain('if (blockers.length === 0)');
    expect(source).toContain('process.exit(0)');
  });
});

/* ------------------------------------------------------------------ */
/*  FAQ                                                               */
/* ------------------------------------------------------------------ */

describe('getFaqs', () => {
  it('retorna array vazio sem FAQs aprovadas', () => {
    expect(getFaqs('ensino')).toEqual([]);
    expect(getFaqs('atividades')).toEqual([]);
    expect(getFaqs('visita')).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  Privacidade                                                       */
/* ------------------------------------------------------------------ */

describe('getPrivacyDoc', () => {
  it('retorna somente body seguro quando documento não está visível', () => {
    const doc = getPrivacyDoc();
    expect(typeof doc.body).toBe('string');
    expect(doc).not.toHaveProperty('review');
    expect(doc).not.toHaveProperty('status');
  });

  it('body é string (pode ser vazio)', () => {
    const doc = getPrivacyDoc();
    expect(typeof doc.body).toBe('string');
  });
});

/* ------------------------------------------------------------------ */
/*  renderPrivacyMarkdown                                             */
/* ------------------------------------------------------------------ */

describe('renderPrivacyMarkdown', () => {
  it('renderiza parágrafos', () => {
    const html = renderPrivacyMarkdown('Texto simples.');
    expect(html).toContain('<p>');
    expect(html).toContain('Texto simples.');
  });

  it('renderiza headings', () => {
    const html = renderPrivacyMarkdown('# Título\n\nParágrafo.');
    expect(html).toContain('<h2>Título</h2>');
  });

  it('renderiza listas', () => {
    const html = renderPrivacyMarkdown('- Item 1\n- Item 2');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item 1</li>');
    expect(html).toContain('<li>Item 2</li>');
  });

  it('escapa HTML cru', () => {
    const html = renderPrivacyMarkdown(
      'Texto <script>alert("xss")</script> perigoso.',
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renderiza links https', () => {
    const html = renderPrivacyMarkdown('[Site](https://example.com)');
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('Site</a>');
  });

  it('não renderiza links http', () => {
    const html = renderPrivacyMarkdown('[Site](http://example.com)');
    expect(html).not.toContain('<a href=');
  });

  it('valida e escapa URLs https antes de criar atributos', () => {
    const html = renderPrivacyMarkdown(
      '[seguro](https://example.com/?q="onmouseover="alert(1))',
    );
    expect(html).toContain(
      '<a href="https://example.com/?q=&quot;onmouseover=&quot;alert(1"',
    );
    expect(html).not.toContain('" onmouseover=');
  });

  it('retorna vazio para input vazio', () => {
    expect(renderPrivacyMarkdown('')).toBe('');
    expect(renderPrivacyMarkdown('   ')).toBe('');
  });
});
