import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Acessibilidade (design-spec §6): varredura axe nas rotas reais.
// Falhas aqui são regressões reais, não espelho de markup.
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
  test(`axe sem violações críticas em ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      critical.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nós)`),
    ).toEqual([]);
  });
}

test('skip link é o primeiro foco por teclado na home', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Pular para o conteúdo' }),
  ).toBeFocused();
});

test('menu aberto não introduz violações axe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
});
