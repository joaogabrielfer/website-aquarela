import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('resultados observados aparecem somente na prévia e sem metadados internos', async ({
  page,
  request,
}, testInfo) => {
  await page.goto('/aprovacoes');
  const cards = page.locator('.approval-card');
  if (testInfo.project.name === 'public') {
    await expect(cards).toHaveCount(0);
    for (const width of [400, 800]) {
      expect(
        (
          await request.get(`/media/approvals/breno-alexandre-${width}.webp`)
        ).status(),
      ).toBe(404);
    }
    await expect(
      page.getByRole('heading', { name: 'Resultados em atualização' }),
    ).toBeVisible();
    await expect(page.getByText('Breno Alexandre')).toHaveCount(0);
    return;
  }

  await expect(cards).toHaveCount(10);
  await expect(
    page.getByRole('heading', { name: 'Breno Alexandre', exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('heading', { name: 'Gabriele Gonçalves', exact: true }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
  const html = await page.content();
  for (const field of [
    'reviewedAt',
    'reviewedBy',
    'publicationAuthorized',
    'Arte fornecida pelo usuário',
  ]) {
    expect(html).not.toContain(field);
  }
  await expect(cards.locator('img')).toHaveCount(10);
  expect(await cards.locator('a, button').count()).toBe(0);
});

for (const width of [320, 390, 768, 1099, 1100, 1440]) {
  test(`mural sem overflow e com retratos legíveis em ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'preview');
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/aprovacoes');
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(10);
    for (const image of await cards.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty('complete', true);
      expect(
        await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
      ).toBeGreaterThan(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const columns = await page
      .locator('.approval-grid')
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
      );
    expect(columns).toBe(width >= 1100 ? 3 : width >= 768 ? 2 : 1);
    if (width === 390 || width === 1440) {
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForFunction(() => window.scrollY === 0);
      await page.screenshot({
        path: `qa/approvals/approvals-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
}

test('mural acessível e com conteúdo presente sem JavaScript', async ({
  browser,
  baseURL,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'preview');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    ...(baseURL ? { baseURL } : {}),
  });
  const page = await context.newPage();
  await page.goto('/aprovacoes');
  await expect(page.locator('.approval-card')).toHaveCount(10);
  await context.close();
});

test('mural sem violações axe graves', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'preview');
  await page.goto('/aprovacoes');
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});
