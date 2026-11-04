import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 767, 768, 1100, 1440]) {
  test(`cards iguais e painel sem reflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/aprovacoes');
    await page.mouse.move(0, 0);
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(8);
    await expect(cards.locator('.achievement')).toHaveCount(10);
    await expect(cards.locator('.approval-count')).toHaveCount(2);
    const geometry = await cards.evaluateAll((items) =>
      items.map((el) => {
        const card = el as HTMLElement;
        return [
          card.offsetLeft,
          card.offsetTop,
          card.offsetWidth,
          card.offsetHeight,
        ];
      }),
    );
    expect(new Set(geometry.map((box) => box[2])).size).toBe(1);
    expect(new Set(geometry.map((box) => box[3])).size).toBe(1);
    const columns = await page
      .locator('.approval-grid')
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
      );
    expect(columns).toBe(width >= 1100 ? 4 : width >= 768 ? 2 : 1);
    if (width === 390 || width === 1440) {
      await page.screenshot({
        path: `test-results/approvals/popover-closed-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
    for (const [index, card] of (await cards.all()).entries()) {
      const trigger = card.getByRole('button', { name: /^Ver detalhes/ });
      await trigger.click();
      const panel = card.locator('.approval-panel');
      await expect(panel).toBeVisible();
      await panel.evaluate(async (el) => {
        await Promise.all(
          el.getAnimations().map((animation) => animation.finished),
        );
      });
      await expect(
        panel.getByRole('button', { name: 'Fechar detalhes' }),
      ).toBeFocused();
      const image = panel.locator('.card-media img');
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
      for (const achievement of await panel.locator('.achievement').all()) {
        await expect(achievement.locator('.card-course')).not.toBeEmpty();
        await expect(achievement.locator('.card-institution')).not.toBeEmpty();
        await expect(achievement.locator('dd')).toHaveCount(2);
        expect(
          await achievement.evaluate((el) => el.scrollWidth <= el.clientWidth),
        ).toBe(true);
      }
      if (width === 390) {
        await panel.screenshot({
          path: `test-results/approvals/popover-person-${index + 1}.png`,
          animations: 'disabled',
        });
      }
      const bounds = await panel.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(901);
      expect(
        await cards.evaluateAll((items) =>
          items.map((el) => {
            const card = el as HTMLElement;
            return [
              card.offsetLeft,
              card.offsetTop,
              card.offsetWidth,
              card.offsetHeight,
            ];
          }),
        ),
      ).toEqual(geometry);
      await panel.getByRole('button', { name: 'Fechar detalhes' }).click();
      await expect(panel).not.toBeVisible();
    }
    await page.mouse.move(0, 0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    if (width === 390 || width === 1440) {
      await cards
        .first()
        .getByRole('button', { name: /^Ver detalhes/ })
        .click();
      const panel = cards.first().locator('.approval-panel');
      await expect(panel).toBeVisible();
      await panel.evaluate(async (el) => {
        await Promise.all(
          el.getAnimations().map((animation) => animation.finished),
        );
      });
      await page.screenshot({
        path: `test-results/approvals/popover-open-${width}.png`,
        animations: 'disabled',
      });
      await expect(panel).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('hover tolerante, troca de pessoa, clique persistente e Escape sem reabrir', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/aprovacoes');
  const cards = page.locator('.approval-card');
  const first = cards.first();
  const panel = first.locator('.approval-panel');
  await first.hover();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(220);
  await expect(panel).not.toBeVisible();
  await first.hover();
  await expect(panel).toBeVisible();
  await panel.hover();
  await page.waitForTimeout(350);
  await expect(panel).toBeVisible();
  await cards.nth(3).hover();
  await expect(cards.nth(3).locator('.approval-panel')).toBeVisible();
  await expect(panel).not.toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator('.approval-panel:popover-open')).toHaveCount(0);
  await first.getByRole('button', { name: /^Ver detalhes/ }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(
    first.getByRole('button', { name: /^Ver detalhes/ }),
  ).toBeFocused();
  await page.waitForTimeout(450);
  await expect(panel).not.toBeVisible();
  await first.hover();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  await expect(panel).not.toBeVisible();
});

test('teclado, movimento real, reduced-motion e axe', async ({
  page,
}, testInfo) => {
  await page.goto('/aprovacoes');
  const card = page.locator('.approval-card').first();
  const trigger = card.getByRole('button', { name: /^Ver detalhes/ });
  const panel = card.locator('.approval-panel');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Space');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Fechar detalhes' }).click();
  const frames = await trigger.evaluate(async (button) => {
    const panel = button
      .closest('.approval-card')!
      .querySelector('.approval-panel')!;
    (button as HTMLButtonElement).click();
    const frames: { time: number; opacity: number; transform: string }[] = [];
    const start = performance.now();
    await new Promise<void>((resolve) => {
      function sample() {
        const style = getComputedStyle(panel);
        frames.push({
          time: performance.now() - start,
          opacity: Number(style.opacity),
          transform: style.transform,
        });
        if (performance.now() - start < 260) requestAnimationFrame(sample);
        else resolve();
      }
      requestAnimationFrame(sample);
    });
    return frames;
  });
  expect(frames.some((frame) => frame.opacity < 0.95)).toBe(true);
  expect(new Set(frames.map((frame) => frame.transform)).size).toBeGreaterThan(
    2,
  );
  expect(frames.at(-1)!.opacity).toBe(1);
  await mkdir('test-results/approvals', { recursive: true });
  await writeFile(
    'test-results/approvals/opening-frames.json',
    JSON.stringify(frames, null, 2),
  );
  await testInfo.attach('quadros-da-abertura', {
    body: JSON.stringify(frames, null, 2),
    contentType: 'application/json',
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  expect(await panel.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(panel).toHaveCSS('transform', 'none');
});

test('toque em tela curta, rolagem interna, toque fora e resize', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 320, height: 360 },
    ...(baseURL ? { baseURL } : {}),
  });
  const page = await context.newPage();
  await page.goto('/aprovacoes');
  const card = page.locator('.approval-card').first();
  await card.getByRole('button', { name: /^Ver detalhes/ }).tap();
  const panel = card.locator('.approval-panel');
  await expect(panel).toBeVisible();
  await panel.evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished),
    );
  });
  const box = await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(360);
  expect(await panel.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await panel.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(panel.locator('.achievement').last()).toBeInViewport();
  const header = await panel.locator('.panel-header').boundingBox();
  const last = await panel.locator('.achievement').last().boundingBox();
  expect(last!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  await expect(
    panel.getByRole('button', { name: 'Fechar detalhes' }),
  ).toBeInViewport();
  await page.touchscreen.tap(2, 2);
  await expect(panel).not.toBeVisible();
  await card.getByRole('button', { name: /^Ver detalhes/ }).tap();
  await page.setViewportSize({ width: 390, height: 500 });
  await expect(panel).not.toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await card.hover();
  await page.waitForTimeout(250);
  await expect(panel).not.toBeVisible();
  await card.getByRole('button', { name: /^Ver detalhes/ }).tap();
  await expect(panel).toBeVisible();
  await context.close();
});

test('wrapper Astro hidratado e sem JS, incluindo ausência de retrato', async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      ...(baseURL ? { baseURL } : {}),
    });
    const page = await context.newPage();
    await page.goto('/qa-fixtures/load-more');
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(2);
    const ids = await cards
      .locator('.approval-panel')
      .evaluateAll((items) => items.map((el) => el.id));
    expect(new Set(ids).size).toBe(2);
    for (const card of await cards.all()) {
      await card.getByRole('button', { name: /^Ver detalhes/ }).click();
      const panel = card.locator('.approval-panel');
      await expect(panel).toBeVisible();
      await expect(panel.locator('.achievement')).toHaveCount(2);
      if (javaScriptEnabled)
        await expect(
          panel.getByRole('button', { name: 'Fechar detalhes' }),
        ).toBeFocused();
      await panel.evaluate(async (el) => {
        await Promise.all(
          el.getAnimations().map((animation) => animation.finished),
        );
      });
      await panel.getByRole('button', { name: 'Fechar detalhes' }).click();
      await expect(panel).not.toBeVisible();
    }
    await context.close();
  }
});

test('painel cede ao menu e rolagem não desloca a grade', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/aprovacoes');
  const card = page.locator('.approval-card').first();
  const trigger = card.getByRole('button', { name: /^Ver detalhes/ });
  await trigger.click();
  const panel = card.locator('.approval-panel');
  await expect(panel).toBeVisible();
  await page.evaluate(() => window.scrollBy(0, 50));
  await expect(panel).toBeVisible();
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(panel).not.toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('wheel nativo rola só o painel com Lenis ativo e mantém Fechar visível', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 420 });
  await page.goto('/aprovacoes');
  await expect(page.locator('html')).toHaveAttribute(
    'data-smooth-scroll',
    'active',
  );
  expect(await page.evaluate(() => matchMedia('(pointer: fine)').matches)).toBe(
    true,
  );
  const card = page.locator('.approval-card').first();
  await card.getByRole('button', { name: /^Ver detalhes/ }).click();
  const panel = card.locator('.approval-panel');
  await expect(panel).toBeVisible();
  await panel.evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished),
    );
  });
  // Aguarda o scroll de navegação até o card estabilizar antes do wheel real.
  await page.waitForTimeout(250);
  const pageY = await page.evaluate(() => scrollY);
  const photo = panel.locator('.card-media img');
  await expect(photo).toHaveCSS('object-fit', 'contain');
  const imageBox = await photo.boundingBox();
  const headerBefore = await panel.locator('.panel-header').boundingBox();
  expect(imageBox!.width / imageBox!.height).toBeCloseTo(0.8, 2);
  expect(imageBox!.y).toBeGreaterThanOrEqual(
    headerBefore!.y + headerBefore!.height,
  );
  expect(imageBox!.y + imageBox!.height).toBeLessThanOrEqual(
    (await panel.boundingBox())!.y + (await panel.boundingBox())!.height,
  );
  const bounds = (await panel.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height - 32,
  );
  await page.mouse.wheel(0, 180);
  await expect
    .poll(() => panel.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(pageY, 1);
  await expect(panel).toBeVisible();
  await page.mouse.wheel(0, 2000);
  await expect
    .poll(() =>
      panel.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop),
    )
    .toBeLessThanOrEqual(1);
  const headerAfter = (await panel.locator('.panel-header').boundingBox())!;
  const last = (await panel.locator('.achievement').last().boundingBox())!;
  expect(headerAfter.y).toBeCloseTo(headerBefore!.y, 1);
  expect(last.y).toBeGreaterThanOrEqual(headerAfter.y + headerAfter.height);
  expect(last.y + last.height).toBeLessThanOrEqual(bounds.y + bounds.height);
  await expect(
    panel.getByRole('button', { name: 'Fechar detalhes' }),
  ).toBeInViewport();
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(pageY, 1);
  await expect(panel).toBeVisible();
  await page.screenshot({
    path: 'test-results/approvals/popover-wheel-short-1440.png',
    animations: 'disabled',
  });
  await panel.getByRole('button', { name: 'Fechar detalhes' }).click();
  await expect(panel).not.toBeVisible();
});
