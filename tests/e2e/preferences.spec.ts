import { test, expect } from '@playwright/test';

test('movimento reduzido mantém conteúdo e navegação operáveis', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Menu principal' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('layout permanece utilizável na aproximação de zoom 200%', async ({
  page,
}) => {
  // Um viewport CSS de 720x450 representa a área útil de 1440x900 a 200%.
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto('/ensino');
  const metrics = await page.evaluate(() => {
    const controls = [...document.querySelectorAll<HTMLElement>('a, button')];
    return {
      documentOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      clippedControls: controls
        .filter(
          (element) =>
            element.scrollWidth > element.clientWidth + 1 ||
            element.scrollHeight > element.clientHeight + 1,
        )
        .map((element) => element.textContent?.trim() || element.ariaLabel),
    };
  });
  expect(metrics.documentOverflow).toBeLessThanOrEqual(1);
  expect(metrics.clippedControls).toEqual([]);
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
});
