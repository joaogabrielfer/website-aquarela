import { test, expect } from '@playwright/test';

for (const [width, height, zoom] of [
  [390, 844, 1],
  [1440, 900, 1],
  [1440, 1100, 1],
  [1280, 600, 1],
  [320, 500, 1],
  [390, 600, 2],
]) {
  test(`Home preenche viewport sem cortar conteúdo ${width}x${height} fonte ${zoom}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    await page.evaluate(async (zoom) => {
      await document.fonts.ready;
      if (zoom === 2) document.documentElement.style.fontSize = '200%';
    }, zoom);
    const wrapper = (await page.locator('.home-first-screen').boundingBox())!;
    const ticker = (await page.locator('.trust-strip').boundingBox())!;
    expect(ticker.y + ticker.height).toBeCloseTo(wrapper.y + wrapper.height, 1);
    expect(ticker.y + ticker.height).toBeGreaterThanOrEqual(height! - 1);
    if (
      (width === 1440 && height === 1100) ||
      (width === 390 && height === 844)
    )
      expect(ticker.y + ticker.height).toBeLessThanOrEqual(height! + 24);
    const hero = (await page.locator('.hero-home').boundingBox())!;
    for (const element of await page
      .locator('.hero-content > *, .hero-actions a')
      .all()) {
      const box = (await element.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(hero.y);
      expect(box.y + box.height).toBeLessThanOrEqual(hero.y + hero.height + 1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if ((zoom === 1 && width === 1440) || (width === 390 && height === 844))
      await page.screenshot({
        path: `test-results/home/home-first-${width}x${height}.png`,
        animations: 'disabled',
      });
  });
}
