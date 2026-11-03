import { describe, expect, it } from 'vitest';
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
  getMediaById,
} from '../../src/lib/content';
import { renderPrivacyMarkdown } from '../../src/lib/privacy';
import { HomePageCopy, SeasonalBanner } from '../../src/lib/content/schemas';

describe('conteúdo único do site', () => {
  it('mantém as quatro etapas, seus turnos e os campos ainda sem material', () => {
    const segments = getSegments();
    expect(segments.map((segment) => segment.slug)).toEqual([
      'educacao-infantil',
      'fundamental-anos-iniciais',
      'fundamental-anos-finais',
      'ensino-medio',
    ]);
    expect(segments[0]?.shifts).toEqual([
      'Manhã: 07:00 às 11:00',
      'Tarde: 13:00 às 17:00',
    ]);
    for (const segment of segments) {
      expect(segment.description).toBeNull();
      expect(segment.imageId).toBeNull();
    }
  });

  it('mostra os dados das atividades sem inventar detalhes ou destaques', () => {
    expect(getActivities().map((activity) => activity.name)).toEqual([
      'Ginástica',
      'Natação',
      'Balé',
    ]);
    expect(getFeaturedActivities()).toEqual([]);
  });

  it('carrega dez conquistas, agrupadas em oito pessoas, com os retratos', () => {
    expect(getApprovals()).toHaveLength(10);
    const groups = getApprovalsGrouped();
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items).toHaveLength(8);
    expect(
      groups[0]?.items.flatMap((person) => person.achievements),
    ).toHaveLength(10);
    for (const approval of getApprovals())
      expect(getMediaById(approval.portraitId!)).not.toBeNull();
    expect(getFeaturedApprovals()).toEqual([]);
  });

  it('mostra ambientes com fotos e não duplica as imagens da galeria', () => {
    expect(getEnvironments()).toHaveLength(11);
    const photos = getEnvironmentPhotos();
    expect(photos.length).toBeGreaterThan(0);
    expect(new Set(photos.map((photo) => photo.id)).size).toBe(photos.length);
    expect(getAlbums()).toEqual([]);
  });

  it('carrega a copy e o Hero sem aprovação por campo', () => {
    expect(getHomePageCopy()?.heroImageId).toBe('hero-colegio');
    expect(getMediaById('hero-colegio')?.src).toBe(
      '/media/hero-colegio-2400.webp',
    );
    expect(getPageCopy('inexistente')).toBeNull();
    expect(getSeasonalBanners()).toHaveLength(1);
  });

  it('mantém conteúdo ausente sem criar informações', () => {
    expect(getFaqs('ensino')).toEqual([]);
    expect(getPrivacyDoc()).toEqual({ body: '' });
  });
});

describe('schemas de conteúdo', () => {
  it('permite Home sem foto enquanto faltar material', () => {
    expect(
      HomePageCopy.safeParse({
        id: 'home',
        title: 'Título',
        intro: null,
        metaDescription: '',
        heroImageId: null,
      }).success,
    ).toBe(true);
  });

  const banner = {
    id: 'aviso',
    eyebrow: null,
    title: 'Aviso',
    body: null,
    tone: 'red',
    active: true,
  };
  it('exige CTA e destino juntos', () => {
    expect(
      SeasonalBanner.safeParse({
        ...banner,
        ctaLabel: 'Saiba mais',
        href: null,
      }).success,
    ).toBe(false);
    expect(
      SeasonalBanner.safeParse({
        ...banner,
        ctaLabel: 'Saiba mais',
        href: '/visite',
      }).success,
    ).toBe(true);
  });
  it('recusa destinos externos e protocolos inseguros no banner', () => {
    for (const href of [
      'https://example.com',
      'javascript:alert(1)',
      '//example.com',
    ])
      expect(
        SeasonalBanner.safeParse({ ...banner, ctaLabel: 'Abrir', href })
          .success,
      ).toBe(false);
  });
  it('usa os tons suportados pelo componente', () => {
    expect(
      SeasonalBanner.safeParse({
        ...banner,
        ctaLabel: null,
        href: null,
        tone: 'verde-arbitrario',
      }).success,
    ).toBe(false);
  });
});

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
