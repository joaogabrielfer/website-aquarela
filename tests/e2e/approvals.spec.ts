import { test, expect, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

async function swipe(page: Page, x: number, y: number, delta: number) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, id: 1 }],
    });
    for (let step = 1; step <= 10; step++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y + (delta * step) / 10, id: 1 }],
      });
      await page.waitForTimeout(16);
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  } finally {
    await session.detach();
  }
}

for (const width of [320, 390, 1440]) {
  test(`cards uniformes, retratos e modal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/aprovacoes');
    const cards = page.locator('.approval-card');
    await expect(cards).toHaveCount(8);
    await expect(cards.locator('.achievement')).toHaveCount(10);
    const sizes = await cards.evaluateAll((cards) =>
      cards.map((el) => [
        (el as HTMLElement).offsetWidth,
        (el as HTMLElement).offsetHeight,
      ]),
    );
    expect(new Set(sizes.map((size) => size.join(':'))).size).toBe(1);
    await page.screenshot({
      path: `test-results/approvals/modal-closed-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    for (const [index, card] of (await cards.all()).entries()) {
      await card.getByRole('button', { name: /^Ver detalhes/ }).click();
      const panel = card.locator('dialog');
      await expect(panel).toBeVisible();
      await panel.evaluate(async (el) => {
        await Promise.allSettled(el.getAnimations().map((a) => a.finished));
      });
      await expect(
        panel.getByRole('button', { name: 'Fechar detalhes' }),
      ).toBeFocused();
      const img = panel.locator('.card-media img');
      await expect(img).toHaveJSProperty('complete', true);
      await expect(img).toHaveCSS('object-fit', 'contain');
      expect(
        await img.evaluate(
          (el: HTMLImageElement) => el.naturalWidth / el.naturalHeight,
        ),
      ).toBeCloseTo(0.8, 2);
      const box = (await img.boundingBox())!;
      expect(box.width / box.height).toBeCloseTo(0.8, 2);
      for (const achievement of await panel.locator('.achievement').all()) {
        await expect(achievement.locator('.card-course')).not.toBeEmpty();
        await expect(achievement.locator('.card-institution')).not.toBeEmpty();
        await expect(achievement.locator('dd')).toHaveCount(2);
        expect(
          await achievement.evaluate((el) => el.scrollWidth <= el.clientWidth),
        ).toBe(true);
      }
      const bounds = (await panel.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(width < 1100 ? 19 : 31);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(
        width - (width < 1100 ? 19 : 31),
      );
      expect(bounds.y).toBeGreaterThanOrEqual(23);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(877);
      if (width === 1440) {
        expect(bounds.width).toBe(760);
        expect(bounds.height).toBe(560);
      }
      if (index === 0)
        await page.screenshot({
          path: `test-results/approvals/modal-open-${width}.png`,
          animations: 'disabled',
        });
      if (width === 390)
        await panel.screenshot({
          path: `test-results/approvals/modal-person-${index + 1}.png`,
          animations: 'disabled',
        });
      expect(
        await cards.evaluateAll((cards) =>
          cards.map((el) => [
            (el as HTMLElement).offsetWidth,
            (el as HTMLElement).offsetHeight,
          ]),
        ),
      ).toEqual(sizes);
      await panel.getByRole('button', { name: 'Fechar detalhes' }).click();
      await expect(panel).not.toBeVisible();
      await expect(
        card.getByRole('button', { name: /^Ver detalhes/ }),
      ).toBeFocused();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('desktop: hover não abre; wheel curto/longo não move o fundo nem fecha', async ({
  page,
}) => {
  for (const height of [900, 420]) {
    await page.setViewportSize({ width: 1440, height });
    await page.goto('/aprovacoes');
    await expect(page.locator('html')).toHaveAttribute(
      'data-smooth-scroll',
      'active',
    );
    const card = page.locator('.approval-card').first();
    await card.hover();
    await page.waitForTimeout(300);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    const originalY = await page.evaluate(() => scrollY);
    await card.getByRole('button', { name: /^Ver detalhes/ }).click();
    const panel = card.locator('dialog');
    await panel.evaluate(async (el) => {
      await Promise.allSettled(el.getAnimations().map((a) => a.finished));
    });
    await expect(page.locator('html')).toHaveAttribute(
      'data-smooth-scroll-state',
      'stopped',
    );
    expect(
      await panel.evaluate((el) => el.scrollHeight > el.clientHeight),
    ).toBe(height === 420);
    const lockedY = await page.evaluate(() => scrollY);
    const box = (await panel.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 30);
    await page.mouse.wheel(0, 2000);
    if (height === 420)
      await expect
        .poll(() => panel.evaluate((el) => el.scrollTop))
        .toBeGreaterThan(0);
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    await expect(panel).toBeVisible();
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(180);
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    await page.mouse.move(5, 5);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(180);
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(originalY, 1);
    await expect(page.locator('html')).toHaveAttribute(
      'data-smooth-scroll-state',
      'active',
    );
  }
});

for (const height of [844, 440]) {
  test(`touchmove real: painel ${height === 844 ? 'curto' : 'longo'}, bordas e backdrop`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height },
      ...(baseURL ? { baseURL } : {}),
    });
    const page = await context.newPage();
    await page.goto('/aprovacoes');
    const card = page.locator('.approval-card').first();
    await card.getByRole('button', { name: /^Ver detalhes/ }).tap();
    const panel = card.locator('dialog');
    await panel.evaluate(async (el) => {
      await Promise.allSettled(el.getAnimations().map((a) => a.finished));
    });
    expect(
      await panel.evaluate((el) => el.scrollHeight > el.clientHeight),
    ).toBe(height === 440);
    const lockedY = await page.evaluate(() => scrollY);
    const box = (await panel.boundingBox())!;
    await swipe(page, box.x + box.width / 2, box.y + box.height - 35, -140);
    if (height === 440)
      await expect
        .poll(() => panel.evaluate((el) => el.scrollTop))
        .toBeGreaterThan(0);
    for (let i = 0; i < 3; i++)
      await swipe(page, box.x + box.width / 2, box.y + box.height - 35, -140);
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole('button', { name: 'Fechar detalhes' }),
    ).toBeInViewport();
    if (height === 440)
      await expect(panel.locator('.achievement').last()).toBeInViewport();
    await swipe(page, 5, Math.min(height - 30, 300), -120);
    await expect(panel).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    for (let i = 0; i < 3; i++)
      await swipe(page, box.x + box.width / 2, box.y + 140, 120);
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    await page.screenshot({
      path: `test-results/approvals/modal-touch-${height}.png`,
      animations: 'disabled',
    });
    if (height === 844) {
      const logo = (await page
        .locator('#site-header .logo-link')
        .boundingBox())!;
      await page.touchscreen.tap(logo.x + 5, logo.y + 5);
      await expect(panel).not.toBeVisible();
      await expect(page).toHaveURL(/\/aprovacoes$/);
      for (const next of (await page.locator('.approval-card').all()).slice(
        0,
        3,
      )) {
        await next.getByRole('button', { name: /^Ver detalhes/ }).tap();
        await expect(page.locator('dialog[open]')).toHaveCount(1);
        await next.locator('.close-details').tap();
        await expect(page.locator('dialog[open]')).toHaveCount(0);
      }
    } else {
      await panel.getByRole('button', { name: 'Fechar detalhes' }).tap();
      await expect(panel).not.toBeVisible();
    }
    expect(await page.evaluate(() => document.body.style.position)).not.toBe(
      'fixed',
    );
    await context.close();
  });
}

test('backdrop consome toque sobre outro card/link; sequências rápidas, Escape e foco', async ({
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
  const cards = page.locator('.approval-card');
  const first = cards.first();
  for (let i = 0; i < 6; i++) {
    const trigger = cards
      .nth(i % 3)
      .getByRole('button', { name: /^Ver detalhes/ });
    await trigger.click();
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  const target = (await cards.nth(3).boundingBox())!;
  const link = page.locator('.desktop-nav a[href="/ensino"]');
  const linkBox = (await link.boundingBox())!;
  await page.evaluate(() => {
    (window as Window & { backgroundClicks?: number }).backgroundClicks = 0;
    document.addEventListener(
      'click',
      (event) => {
        if (
          (event.target as Element).closest('.details-control, .desktop-nav a')
        )
          (window as Window & { backgroundClicks?: number })
            .backgroundClicks!++;
      },
      true,
    );
  });
  for (const point of [
    { x: target.x + target.width - 10, y: target.y + 20 },
    { x: linkBox.x + 5, y: linkBox.y + 5 },
  ]) {
    await first.getByRole('button', { name: /^Ver detalhes/ }).click();
    const before = await page.evaluate(
      () => (window as Window & { backgroundClicks?: number }).backgroundClicks,
    );
    await page.touchscreen.tap(point.x, point.y);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          (window as Window & { backgroundClicks?: number }).backgroundClicks,
      ),
    ).toBe(before);
    await expect(page).toHaveURL(/\/aprovacoes$/);
  }
  await context.close();
});

test('entrada e saída em quadros, teclado, reduced-motion e axe modal', async ({
  page,
}) => {
  await page.goto('/aprovacoes');
  const card = page.locator('.approval-card').first();
  const trigger = card.getByRole('button', { name: /^Ver detalhes/ });
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(card.locator('dialog')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(card.locator('dialog')).not.toBeVisible();
  await page.keyboard.press('Enter');
  await expect(card.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card.locator('dialog')).not.toBeVisible();
  const frames = await trigger.evaluate(async (button) => {
    const panel = button.closest('.approval-card')!.querySelector('dialog')!;
    async function sample() {
      const frames: {
        opacity: number;
        transform: string;
        open: boolean;
        time: number;
      }[] = [];
      const start = performance.now();
      await new Promise<void>((resolve) => {
        function frame() {
          const style = getComputedStyle(panel);
          frames.push({
            opacity: Number(style.opacity),
            transform: style.transform,
            open: panel.open,
            time: performance.now() - start,
          });
          if (performance.now() - start < 210) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
      return frames;
    }
    (button as HTMLButtonElement).click();
    const entrance = await sample();
    panel.querySelector<HTMLButtonElement>('.close-details')!.click();
    const exit = await sample();
    return { entrance, exit };
  });
  expect(frames.entrance.some((frame) => frame.opacity < 0.9)).toBe(true);
  expect(
    new Set(frames.entrance.map((frame) => frame.transform)).size,
  ).toBeGreaterThan(2);
  expect(frames.exit.some((frame) => frame.open && frame.opacity < 0.7)).toBe(
    true,
  );
  expect(frames.exit.at(-1)!.open).toBe(false);
  await mkdir('test-results/approvals', { recursive: true });
  await writeFile(
    'test-results/approvals/modal-motion.json',
    JSON.stringify(frames, null, 2),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  expect(
    await card.locator('dialog').evaluate((el) => el.getAnimations().length),
  ).toBe(0);
  await card.locator('.close-details').click();
  await expect(card.locator('dialog')).not.toBeVisible();
});

test('wrapper Astro com/sem JS e sem retrato', async ({ browser, baseURL }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      ...(baseURL ? { baseURL } : {}),
    });
    const page = await context.newPage();
    await page.goto('/qa-fixtures/load-more');
    for (const card of await page.locator('.approval-card').all()) {
      await card.getByRole('button', { name: /^Ver detalhes/ }).click();
      await expect(card.locator('dialog')).toBeVisible();
      await expect(card.locator('.achievement')).toHaveCount(2);
      await card.locator('dialog').evaluate(async (el) => {
        await Promise.allSettled(el.getAnimations().map((a) => a.finished));
      });
      await card.locator('.close-details').click();
      await expect(card.locator('dialog')).not.toBeVisible();
    }
    await context.close();
  }
});
