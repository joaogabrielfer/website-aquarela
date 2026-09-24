import { test, expect } from '@playwright/test';

test('preview usa a opção 6 do hero com variantes responsivas', async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== 'preview',
    'somente preview editorial',
  );
  await page.goto('/');
  const hero = page.locator('img.hero-photo');
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute('src', /hero-colegio-1600\.webp$/);
  await expect(hero).toHaveAttribute(
    'srcset',
    /hero-colegio-480\.webp 480w.*hero-colegio-1600\.webp 1600w/,
  );
  expect(
    await hero.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
});

test('ambientes reais abrem o lightbox a partir do cartão', async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== 'preview',
    'somente preview editorial',
  );
  await page.goto('/nosso-espaco');
  const cards = page.locator('.environment-card');
  await expect(cards).toHaveCount(9);
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

test('build público não antecipa mídia sem identificador editorial', async ({
  page,
  request,
}) => {
  test.skip(test.info().project.name !== 'public', 'somente build público');
  await page.goto('/');
  await expect(page.locator('img.hero-photo')).toHaveCount(0);
  await page.goto('/nosso-espaco');
  await expect(page.locator('.environment-card')).toHaveCount(0);
  const directAsset = await request.get('/media/hero-colegio-1600.webp');
  expect(directAsset.status()).toBe(404);
});
