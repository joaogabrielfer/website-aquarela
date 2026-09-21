import { test, expect } from '@playwright/test';

// R01/R03: rotas abrem por link direto e refresh, com shell e H1 único.
// Não cobre `interesse` de Visite (outro lote): aqui só comportamento base.
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
  test(`rota ${route} responde 200 com shell e H1 único`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(
      page.getByRole('link', { name: 'Pular para o conteúdo' }),
    ).toBeVisible();
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('main h1')).toHaveCount(1);
  });

  test(`rota ${route} sobrevive a refresh`, async ({ page }) => {
    await page.goto(route);
    const h1 = await page.locator('main h1').first().textContent();
    await page.reload();
    expect(page.url()).toContain(route === '/' ? '/' : route);
    await expect(page.locator('main h1').first()).toHaveText(h1 ?? '');
  });
}

test('deep link de etapa ancora abaixo do header e sobrevive a refresh', async ({
  page,
}) => {
  await page.goto('/ensino#educacao-infantil');
  const target = page.locator('#educacao-infantil');
  await expect(target).toBeVisible();
  const headerBox = await page.locator('header.site-header').boundingBox();
  const targetBox = await target.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  if (headerBox && targetBox) {
    expect(targetBox.y).toBeGreaterThanOrEqual(headerBox.height - 1);
  }
  await page.reload();
  await expect(page.locator('#educacao-infantil')).toBeVisible();
});

test('query desconhecida não quebra rota nem muda H1', async ({ page }) => {
  await page.goto('/ensino');
  const h1 = await page.locator('main h1').first().textContent();
  const response = await page.goto('/ensino?filtro=invalido');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main h1').first()).toHaveText(h1 ?? '');
});

test('slug de álbum desconhecido é 404 com destinos úteis', async ({
  page,
}) => {
  const response = await page.goto('/galeria/slug-inexistente-xyz-123');
  expect(response?.status()).toBe(404);
  await expect(page.locator('main h1')).toContainText('Página não encontrada');
  await expect(
    page.getByRole('link', { name: 'Voltar ao início' }),
  ).toBeVisible();
});

test('rota inexistente é 404 com shell e links de saída', async ({ page }) => {
  const response = await page.goto('/rota-que-nao-existe-xyz');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('header.site-header')).toBeVisible();
  await expect(page.locator('footer.site-footer')).toBeVisible();
  await expect(page.locator('main h1')).toContainText('Página não encontrada');
  await expect(
    page.getByRole('link', { name: 'Voltar ao início' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Falar com o colégio' }),
  ).toBeVisible();
});
