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

  await expect(cards).toHaveCount(8);
  await expect(
    page.getByRole('heading', { name: 'Breno Alexandre', exact: true }),
  ).toHaveCount(1);
  const breno = cards.filter({
    has: page.getByRole('heading', { name: 'Breno Alexandre', exact: true }),
  });
  await expect(breno.locator('.approval-count')).toHaveText('2 aprovações');
  await expect(breno.locator('.achievement')).toHaveCount(2);
  await expect(breno).toContainText('Fuzileiro Naval');
  await expect(breno).toContainText('Aprendizes-Marinheiros');
  await expect(cards.locator('.achievement')).toHaveCount(10);
  await expect(cards.locator('.approval-count')).toHaveCount(2);
  await expect(
    cards
      .filter({
        has: page.getByRole('heading', {
          name: 'Gabriele Gonçalves',
          exact: true,
        }),
      })
      .locator('.approval-count'),
  ).toHaveCount(0);
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
  await expect(cards.locator('img')).toHaveCount(8);
  expect(await cards.locator('a, button').count()).toBe(0);
});

for (const width of [320, 390, 767, 768, 1099, 1100, 1440, 1920]) {
  test(`mural sem overflow e com retratos legíveis em ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'preview');
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/aprovacoes');
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(8);
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
    expect(columns).toBe(width >= 1100 ? 4 : width >= 768 ? 2 : 1);
    for (const card of await cards.all()) {
      const media = await card.locator('.card-media').boundingBox();
      const body = await card.locator('.card-body').boundingBox();
      expect(media).not.toBeNull();
      expect(body).not.toBeNull();
      if (width < 768) {
        expect(media!.x + media!.width).toBeLessThanOrEqual(body!.x + 1);
        expect(Math.abs(media!.y - body!.y)).toBeLessThanOrEqual(1);
      } else {
        expect(media!.y + media!.height).toBeLessThanOrEqual(body!.y + 1);
      }
      if (width >= 1100) {
        const box = await card.boundingBox();
        expect(box!.width).toBeLessThanOrEqual(306);
        expect(media!.height).toBeLessThan(250);
      }
    }
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
  await expect(page.locator('.approval-card')).toHaveCount(8);
  await expect(page.locator('.achievement')).toHaveCount(10);
  await expect(page.getByText('2 aprovações', { exact: true })).toHaveCount(2);
  await context.close();
});

test('mural sem violações axe graves', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'preview');
  await page.goto('/aprovacoes');
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});

test('hover das aprovações repete a ampliação de Ensino e respeita movimento reduzido', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'preview');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const segment = page.locator('.segment-card').first();
  await segment.hover();
  await expect(segment).toHaveCSS(
    'transform',
    'matrix(1.02, 0, 0, 1.02, 0, 0)',
  );
  const teachingTransition = await segment.evaluate(
    (el) => getComputedStyle(el).transition,
  );
  await page.goto('/aprovacoes');
  const card = page.locator('.approval-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const initial = await card.boundingBox();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'matrix(1.02, 0, 0, 1.02, 0, 0)');
  expect(await card.evaluate((el) => getComputedStyle(el).transition)).toBe(
    teachingTransition,
  );
  const enlarged = await card.boundingBox();
  expect(enlarged!.width / initial!.width).toBeCloseTo(1.02, 2);
  await expect(card).toHaveCSS('border-top-color', 'rgb(0, 76, 115)');
  expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(
    'none',
  );
  await page.screenshot({ path: 'qa/approvals/approvals-hover-1440.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('transition-duration', '0s');
});

test('ponteiro de toque não amplia os cards mesmo em largura desktop', async ({
  browser,
  baseURL,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'preview');
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1440, height: 900 },
    ...(baseURL ? { baseURL } : {}),
  });
  const page = await context.newPage();
  await page.goto('/aprovacoes');
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);
  const card = page.locator('.approval-card').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await context.close();
});
