import { test, expect, type Page } from '@playwright/test';

const output = 'qa/phase-3/final';
const routes = [
  ['home', '/'],
  ['ensino', '/ensino'],
  ['nosso-espaco', '/nosso-espaco'],
  ['aprovacoes', '/aprovacoes'],
  ['atividades', '/atividades'],
  ['galeria', '/galeria'],
  ['visite', '/visite'],
] as const;

const waitForStablePage = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(50);
};

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  for (const [name, route] of routes) {
    test(`evidência visual ${name} ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      test.skip(test.info().project.name !== 'preview', 'matriz editorial');
      await page.setViewportSize(viewport);
      await page.goto(route);
      await waitForStablePage(page);
      await page.screenshot({
        path: `${output}/${name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
}

for (const viewport of [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]) {
  for (const [name, route] of routes.filter(([name]) =>
    ['home', 'ensino', 'visite', 'galeria'].includes(name),
  )) {
    test(`evidência complementar ${name} ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      test.skip(test.info().project.name !== 'preview', 'matriz editorial');
      await page.setViewportSize(viewport);
      await page.goto(route);
      await waitForStablePage(page);
      await page.screenshot({
        path: `${output}/${name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
}

for (const viewport of [
  { width: 320, height: 700 },
  { width: 1920, height: 1080 },
]) {
  test(`evidência extrema home ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    test.skip(test.info().project.name !== 'preview', 'matriz editorial');
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForStablePage(page);
    await page.screenshot({
      path: `${output}/home-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });
}

test('evidência do menu em 1099 e cabeçalho em 1100', async ({ page }) => {
  test.skip(test.info().project.name !== 'preview', 'matriz editorial');
  await page.setViewportSize({ width: 1099, height: 800 });
  await page.goto('/ensino');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toBeVisible();
  await page.screenshot({
    path: `${output}/header-menu-1099x800.png`,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `${output}/header-desktop-1100x800.png`,
    animations: 'disabled',
  });
});

const svg = (width: number, height: number, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/></svg>`,
  )}`;

test('evidência do lightbox sintético em retrato, paisagem e erro', async ({
  page,
}) => {
  test.skip(test.info().project.name !== 'preview', 'matriz editorial');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/nosso-espaco');
  await page.evaluate(
    ({ portrait, landscape }) => {
      window.dispatchEvent(
        new CustomEvent('aquarela:lightbox', {
          detail: {
            photos: [
              {
                src: portrait,
                alt: 'Fixture sintética em retrato',
                caption:
                  'Legenda sintética longa para conferir a leitura e a preservação dos controles em telas estreitas.',
              },
              {
                src: landscape,
                alt: 'Fixture sintética em paisagem',
                caption: 'Fixture sintética em paisagem.',
              },
              {
                src: '/qa/imagem-sintetica-ausente.jpg',
                alt: 'Fixture sintética com erro',
              },
            ],
            index: 0,
          },
        }),
      );
    },
    {
      portrait: svg(600, 900, '#6b5ca5'),
      landscape: svg(1200, 600, '#37a6a5'),
    },
  );
  const dialog = page.getByRole('dialog', { name: 'Visualização de fotos' });
  await expect(dialog).toBeVisible();
  await page.screenshot({
    path: `${output}/lightbox-portrait-390x844.png`,
    animations: 'disabled',
  });

  await page.keyboard.press('ArrowRight');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(dialog.getByText('2 de 3')).toBeVisible();
  await page.screenshot({
    path: `${output}/lightbox-landscape-844x390.png`,
    animations: 'disabled',
  });

  await page.keyboard.press('ArrowRight');
  await expect(
    dialog.getByText('Não foi possível carregar esta foto'),
  ).toBeVisible();
  await page.screenshot({
    path: `${output}/lightbox-error-844x390.png`,
    animations: 'disabled',
  });
});
