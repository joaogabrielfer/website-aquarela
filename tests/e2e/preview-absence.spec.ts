import { test, expect } from '@playwright/test';

// D01/D06/D10/C10: público só com approved; preview explícito com faixa,
// noindex e marcadores sintéticos identificados. O teste falha se a fixture
// de demonstração vazar para o público.
test('modo público não expõe marcadores de preview', async ({ page }) => {
  test.skip(test.info().project.name !== 'public', 'somente projeto public');
  await page.goto('/ensino');
  await expect(page.getByText('Prévia', { exact: true })).toHaveCount(0);
  const html = await page.content();
  expect(html).not.toContain('Texto demonstrativo');
  expect(html).not.toContain('Foto oficial pendente');
  expect(html).not.toContain('AssetPlaceholder');
  expect(html).not.toContain('reviewedBy');
  expect(html).not.toContain('reviewedAt');
  const robots = page.locator('meta[name="robots"]');
  if ((await robots.count()) > 0) {
    await expect(robots.first()).not.toHaveAttribute('content', /noindex/);
  }
});

test('todas as rotas públicas sem marcadores de preview', async ({ page }) => {
  test.skip(test.info().project.name !== 'public', 'somente projeto public');
  const routes = [
    '/',
    '/ensino',
    '/nosso-espaco',
    '/aprovacoes',
    '/atividades',
    '/galeria',
    '/visite',
    '/privacidade',
  ];
  for (const route of routes) {
    await page.goto(route);
    const html = await page.content();
    expect(html, route).not.toContain('Texto demonstrativo');
    expect(html, route).not.toContain('Foto oficial pendente');
  }
});

test('modo preview exibe faixa Prévia e noindex', async ({ page }) => {
  test.skip(test.info().project.name !== 'preview', 'somente projeto preview');
  await page.goto('/ensino');
  await expect(page.getByText('Prévia', { exact: true }).first()).toBeVisible();
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]'),
  ).toHaveCount(1);
});
