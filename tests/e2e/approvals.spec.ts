import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 767, 768, 1440]) {
  test(`cards compactos e detalhes completos em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/aprovacoes');
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(8);
    await expect(cards.locator('.achievement')).toHaveCount(10);
    await expect(cards.locator('.approval-count')).toHaveCount(2);
    await expect(page.locator('.approval-card[open]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    for (const card of await cards.all()) {
      await expect(card.locator('summary')).toContainText('Ver detalhes');
      await expect(card.locator('.card-body')).not.toBeVisible();
      await expect(card.locator('summary a, summary button')).toHaveCount(0);
      await expect(card.locator('summary')).toHaveCSS('cursor', 'pointer');
      const avatar = card.locator('.card-avatar img');
      await avatar.scrollIntoViewIfNeeded();
      await expect(avatar).toHaveJSProperty('complete', true);
      expect(
        await avatar.evaluate((img: HTMLImageElement) => img.naturalWidth),
      ).toBeGreaterThan(0);
    }
    const breno = cards.filter({
      has: page.getByRole('heading', { name: 'Breno Alexandre', exact: true }),
    });
    await expect(breno.locator('.course-summary')).toContainText(
      'Fuzileiro Naval',
    );
    await expect(breno.locator('.course-summary')).toContainText(
      'Aprendizes-Marinheiros',
    );
    const columns = await page
      .locator('.approval-grid')
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
      );
    expect(columns).toBe(width >= 1100 ? 4 : width >= 768 ? 2 : 1);
    if (width === 390 || width === 1440) {
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.screenshot({
        path: `test-results/approvals/avatar-closed-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
    const neighborHeight = (await cards.nth(1).boundingBox())!.height;
    for (const card of await cards.all()) {
      const summary = card.locator('summary');
      await summary.click();
      await expect(card).toHaveAttribute('open', '');
      await expect(summary).toContainText('Fechar detalhes');
      await expect(card.locator('.card-avatar')).not.toBeVisible();
      const image = card.locator('.card-media img');
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty('complete', true);
      await expect(image).toHaveCSS('object-fit', 'contain');
      const photo = await image.evaluate((img: HTMLImageElement) => ({
        w: img.clientWidth,
        h: img.clientHeight,
        natural: img.naturalWidth / img.naturalHeight,
      }));
      expect(photo.natural).toBeCloseTo(0.8, 2);
      expect(photo.w / photo.h).toBeCloseTo(0.8, 2);
      expect(photo.h).toBeLessThanOrEqual(541);
      for (const achievement of await card.locator('.achievement').all()) {
        await expect(achievement).toBeVisible();
        await expect(achievement.locator('.card-course')).not.toBeEmpty();
        await expect(achievement.locator('.card-institution')).not.toBeEmpty();
        await expect(achievement.locator('dd')).toHaveCount(2);
        const bounds = await achievement.evaluate((el) => ({
          client: el.clientWidth,
          scroll: el.scrollWidth,
        }));
        expect(bounds.scroll).toBeLessThanOrEqual(bounds.client);
      }
      await summary.click();
      await expect(card).not.toHaveAttribute('open');
    }
    await breno.locator('summary').click();
    expect((await cards.nth(1).boundingBox())!.height).toBeCloseTo(
      neighborHeight,
      1,
    );
    const jose = cards.filter({
      has: page.getByRole('heading', {
        name: 'José Cauã / José Kauã',
        exact: true,
      }),
    });
    await jose.locator('summary').click();
    if (width === 390 || width === 1440) {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      await page.screenshot({
        path: `test-results/approvals/avatar-open-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('Enter e Espaço alternam os detalhes mantendo o foco', async ({
  page,
}) => {
  await page.goto('/aprovacoes');
  const card = page.locator('.approval-card').first();
  const summary = card.locator('summary');
  await summary.focus();
  for (const key of ['Enter', 'Space', 'Space', 'Enter']) {
    const wasOpen = await card.evaluate((el: HTMLDetailsElement) => el.open);
    await page.keyboard.press(key);
    await expect(card).toHaveJSProperty('open', !wasOpen);
    await expect(summary).toBeFocused();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(summary).toHaveCSS('transition-duration', '0s');
});

test('mural aberto sem violações axe', async ({ page }) => {
  await page.goto('/aprovacoes');
  await page.locator('.approval-card summary').first().click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('mural e wrapper da Home abrem sem JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    ...(baseURL ? { baseURL } : {}),
  });
  const page = await context.newPage();
  for (const path of ['/aprovacoes', '/qa-fixtures/load-more']) {
    await page.goto(path);
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(path === '/aprovacoes' ? 8 : 2);
    for (const card of await cards.all()) {
      await card.locator('summary').click();
      await expect(card.locator('.achievement-list')).toBeVisible();
      if (await card.locator('.card-media img').count()) {
        await expect(card.locator('.card-media img')).toBeVisible();
      }
      await card.locator('summary').click();
      await expect(card.locator('.card-body')).not.toBeVisible();
    }
  }
  await context.close();
});
