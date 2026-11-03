import { test, expect } from '@playwright/test';

test('home usa a opção 6 do hero com variantes responsivas', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('img.hero-photo');
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute('src', /hero-colegio-2400\.webp$/);
  await expect(hero).toHaveAttribute(
    'srcset',
    /hero-colegio-480\.webp 480w.*hero-colegio-2400\.webp 2400w/,
  );
  expect(
    await hero.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
});

test('ambientes reais abrem o lightbox a partir do cartão', async ({
  page,
}) => {
  await page.goto('/nosso-espaco');
  const cards = page.locator('.environment-card');
  await expect(cards).toHaveCount(11);
  const trigger = page
    .getByRole('button', { name: 'Ampliar foto: Sala Google for Education' })
    .first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Visualização de fotos' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('1 de 1')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
