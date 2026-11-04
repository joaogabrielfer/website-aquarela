import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('mural exibe oito pessoas e dez conquistas com retratos disponíveis', async ({
  page,
  request,
}) => {
  await page.goto('/aprovacoes');
  const cards = page.locator('.approval-card');
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
  const html = await page.content();
  for (const field of [
    'reviewedAt',
    'reviewedBy',
    'publicationAuthorized',
    'Arte fornecida pelo usuário',
  ]) {
    expect(html).not.toContain(field);
  }
  for (const width of [400, 800]) {
    const asset = await request.get(
      `/media/approvals/breno-alexandre-${width}.webp`,
    );
    expect(asset.status()).toBe(200);
  }
  await expect(cards.locator('img')).toHaveCount(8);
  expect(await cards.locator('a, button').count()).toBe(0);
});

for (const width of [320, 390, 767, 768, 1099, 1100, 1440, 1920]) {
  test(`mural sem overflow e com retratos legíveis em ${width}px`, async ({
    page,
  }) => {
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
        path: `test-results/approvals/approvals-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
}

test('mural acessível e com conteúdo presente sem JavaScript', async ({
  browser,
  baseURL,
}) => {
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

test('mural sem violações axe graves', async ({ page }) => {
  await page.goto('/aprovacoes');
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});

test('hover das aprovações repete a ampliação de Ensino e respeita movimento reduzido', async ({
  page,
}) => {
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
  await page.screenshot({
    path: 'test-results/approvals/approvals-hover-1440.png',
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('transition-duration', '0s');
});

test('ponteiro de toque não amplia os cards mesmo em largura desktop', async ({
  browser,
  baseURL,
}) => {
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

for (const width of [320, 390, 767, 768, 1440]) {
  test(`comparação de retratos preserva conteúdo e layout em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/aprovacoes');
    const reference = await page.locator('.approval-card').allTextContents();
    const geometry = await page.locator('.approval-card').evaluateAll((cards) =>
      cards.map((card) => {
        const media = card
          .querySelector('.card-media')!
          .getBoundingClientRect();
        const image = card.querySelector('img')!.getBoundingClientRect();
        return [media.width, media.height, image.width, image.height];
      }),
    );
    if (width < 768) {
      for (const card of await page.locator('.approval-card').all()) {
        const media = card.locator('.card-media');
        await expect(media).toHaveCSS('align-items', 'center');
        const panel = await media.boundingBox();
        const image = await media.locator('img').boundingBox();
        expect(
          Math.abs(image!.y - panel!.y - (panel!.height - image!.height) / 2),
        ).toBeLessThanOrEqual(1);
      }
    }
    for (const variant of ['rosto-e-ombros', 'avatar', 'retrato-inteiro']) {
      await page.goto(`/comparar-aprovacoes/${variant}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex',
      );
      const navigation = page.getByRole('navigation', {
        name: 'Opções de retrato',
      });
      await expect(navigation.locator('a')).toHaveCount(4);
      await expect(navigation.locator('[aria-current="page"]')).toHaveAttribute(
        'href',
        `/comparar-aprovacoes/${variant}`,
      );
      const cards = page.locator('.approval-card');
      await expect(cards).toHaveCount(8);
      await expect(cards.locator('.achievement')).toHaveCount(10);
      expect(await cards.allTextContents()).toEqual(reference);
      for (const image of await cards.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(
          await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
        ).toBeGreaterThan(0);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const achievement of await cards.locator('.achievement').all()) {
        const bounds = await achievement.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
        }));
        expect(bounds.scroll).toBeLessThanOrEqual(bounds.width);
      }
      const actual = await cards.evaluateAll((cards) =>
        cards.map((card) => {
          const media = card
            .querySelector('.card-media')!
            .getBoundingClientRect();
          const image = card.querySelector('img')!.getBoundingClientRect();
          const body = card
            .querySelector('.card-body')!
            .getBoundingClientRect();
          return {
            sizes: [
              media.width,
              media.height,
              image.width,
              image.height,
            ] as const,
            imageTop: image.y - media.y,
            imageBottom: image.bottom - media.bottom,
            imageRatio: image.width / image.height,
            fit: getComputedStyle(card.querySelector('img')!).objectFit,
            top: media.y - body.y,
            right: media.right - body.x,
          };
        }),
      );
      if (width >= 768)
        expect(actual.map((item) => item.sizes)).toEqual(geometry);
      else {
        for (const item of actual) {
          expect(item.right).toBeLessThanOrEqual(1);
          expect(item.top).toBe(variant === 'avatar' ? 16 : 0);
          if (variant === 'retrato-inteiro') {
            expect(Math.abs(item.imageTop)).toBeLessThanOrEqual(1);
            expect(item.imageBottom).toBeLessThanOrEqual(1);
            expect(item.imageRatio).toBeCloseTo(4 / 5, 2);
            expect(item.fit).toBe('contain');
            expect(item.sizes[2]).toBeCloseTo(item.sizes[0] - 4, 1);
          }
        }
        if (variant === 'rosto-e-ombros')
          expect(new Set(actual.map((item) => item.sizes[1]))).toEqual(
            new Set([190]),
          );
      }
      if ([320, 390, 767, 768, 1440].includes(width)) {
        await page.evaluate(async () => {
          await document.fonts.ready;
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
        await page.waitForFunction(() => window.scrollY === 0);
        await page.screenshot({
          path: `test-results/approvals/comparison-${variant}-${width}.png`,
          fullPage: true,
          animations: 'disabled',
        });
      }
    }
    await page
      .getByRole('navigation', { name: 'Opções de retrato' })
      .getByRole('link', { name: 'Avatar', exact: true })
      .click();
    await expect(page).toHaveURL(/\/comparar-aprovacoes\/avatar$/);
  });
}
