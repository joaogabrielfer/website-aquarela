import { test, expect, type Page } from '@playwright/test';

const svg = (width: number, height: number, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${color}"/></svg>`,
  )}`;

const photos = [
  {
    src: svg(600, 900, '#6b5ca5'),
    alt: 'Fixture sintética em retrato',
    caption:
      'Legenda sintética longa para verificar leitura, rolagem e preservação dos controles em uma área reduzida.',
    width: 600,
    height: 900,
  },
  {
    src: svg(1200, 600, '#37a6a5'),
    alt: 'Fixture sintética em paisagem',
    caption: 'Fixture sintética em paisagem.',
    width: 1200,
    height: 600,
  },
  {
    src: '/qa/imagem-sintetica-ausente.jpg',
    alt: 'Fixture sintética com erro',
    caption: 'Fixture sintética que valida o estado de erro.',
    width: 800,
    height: 600,
  },
];

const openLightbox = async (page: Page, index = 0) => {
  await page.goto('/nosso-espaco');
  const trigger = page.getByRole('link', { name: 'Fale com a equipe' });
  await trigger.focus();
  await page.evaluate(
    ({ items, initialIndex }) => {
      window.dispatchEvent(
        new CustomEvent('aquarela:lightbox', {
          detail: { photos: items, index: initialIndex },
        }),
      );
    },
    { items: photos, initialIndex: index },
  );
  const dialog = page.getByRole('dialog', { name: 'Visualização de fotos' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Fechar' })).toBeFocused();
  return { dialog, trigger };
};

for (const viewport of [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  test(`lightbox preserva controles em ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const { dialog } = await openLightbox(page);
    await expect(dialog.getByText('1 de 3')).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Foto anterior' }),
    ).toBeDisabled();
    await expect(
      dialog.getByRole('button', { name: 'Próxima foto' }),
    ).toBeEnabled();
    await expect(
      dialog.getByAltText('Fixture sintética em retrato'),
    ).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('2 de 3')).toBeVisible();
    await expect(
      dialog.getByAltText('Fixture sintética em paisagem'),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('3 de 3')).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Próxima foto' }),
    ).toBeDisabled();
    await expect(
      dialog.getByText('Não foi possível carregar esta foto'),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeVisible();
  });
}

test('Escape fecha o lightbox e devolve foco ao acionador', async ({
  page,
}) => {
  const { dialog, trigger } = await openLightbox(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Tab permanece no lightbox e o menu não sobrepõe o diálogo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { dialog } = await openLightbox(page);
  const close = dialog.getByRole('button', { name: 'Fechar' });
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('button', { name: 'Próxima foto' }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.evaluate(() => {
    document
      .querySelector<HTMLButtonElement>('button[aria-label="Abrir menu"]')
      ?.click();
  });
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toHaveCount(0);
  await expect(dialog).toBeVisible();
});
