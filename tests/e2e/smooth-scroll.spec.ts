import { test, expect } from '@playwright/test';

test('smooth scroll para overlay e retoma ao fechar', async ({ page }) => {
  test.skip(
    process.env.ENABLE_SMOOTH_SCROLL === 'false',
    'ilha desligada pelo kill switch de build',
  );
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-smooth-scroll',
    'active',
  );

  const stopped = await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'test', open: true },
      }),
    );
    return (document.documentElement as HTMLElement).dataset.smoothScrollState;
  });
  expect(stopped).toBe('stopped');
  await expect(page.locator('html')).toHaveClass(/lenis-stopped/);
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'test', open: false },
      }),
    );
  });
  await expect(page.locator('html')).toHaveAttribute(
    'data-smooth-scroll-state',
    'active',
  );
  await expect(page.locator('html')).not.toHaveClass(/lenis-stopped/);
  await page
    .locator('.skip-link')
    .evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('#main-content')).toBeInViewport();
});

test('flag de build desativada não monta a ilha', async ({ page }) => {
  test.skip(
    process.env.ENABLE_SMOOTH_SCROLL !== 'false' ||
      test.info().project.name !== 'public',
    'requer build público com ENABLE_SMOOTH_SCROLL=false',
  );
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-smooth-scroll',
    'active',
  );
});
