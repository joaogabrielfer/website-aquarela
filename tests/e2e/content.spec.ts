import { test, expect } from '@playwright/test';

for (const route of [
  '/',
  '/ensino',
  '/nosso-espaco',
  '/aprovacoes',
  '/atividades',
  '/galeria',
  '/visite',
  '/privacidade',
]) {
  test(`conteúdo único sem faixa editorial em ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByText('Prévia', { exact: true })).toHaveCount(0);
    const html = await page.content();
    expect(html).not.toContain('reviewedBy');
    expect(html).not.toContain('reviewedAt');
    expect(html).not.toContain('publicationAuthorized');
  });
}
