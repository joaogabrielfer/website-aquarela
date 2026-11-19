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
  const trigger = page
    .getByRole('button', { name: 'Ampliar foto: Espaço de leitura' })
    .first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Visualização de fotos' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('1 de 1')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('cards de Ensino carregam fotos responsivas e levam à etapa correspondente', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('#etapas .segment-card');
  await expect(cards).toHaveCount(4);

  for (const card of await cards.all()) {
    const image = card.getByRole('img');
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('srcset', /480\.webp 480w/);
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
  }

  const firstCard = cards.first();
  const href = await firstCard.getAttribute('href');
  await firstCard.click();
  await expect(page).toHaveURL(new RegExp(href + '$'));
  await expect(
    page.locator('#educacao-infantil .segment-detail-photo'),
  ).toHaveAttribute('src', /infantil-atividade-com-pecas-1600\.webp$/);
});

test('Galeria pagina as fotos e permite navegar por todo o acervo', async ({
  page,
}) => {
  await page.goto('/galeria');
  const thumbnails = page.locator('.photo-thumb');
  await expect(thumbnails).toHaveCount(12);

  const more = page.getByRole('button', { name: 'Carregar mais fotos' });
  await more.click();
  await expect(thumbnails).toHaveCount(24);
  await expect(thumbnails.last()).toHaveAccessibleName(/foto 24 de \d+/);

  const lastLoaded = thumbnails.last();
  await lastLoaded.click();
  const dialog = page.getByRole('dialog', { name: 'Visualização de fotos' });
  await expect(dialog.getByText(/24 de \d+/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText(/25 de \d+/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lastLoaded).toBeFocused();
});
