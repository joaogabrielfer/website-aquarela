import { test, expect } from '@playwright/test';

// C01: menu compacto — foco, Esc/Tab e cruzamento 1099→1100.
// Viewport mobile garante botão visível (menu compacto em largura <1100).
test.use({ viewport: { width: 390, height: 844 } });

const openMenu = async (page: import('@playwright/test').Page) => {
  const trigger = page.getByRole('button', { name: 'Abrir menu' });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Menu principal' });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
};

test('abrir foca Fechar e torna fundo inerte', async ({ page }) => {
  await page.goto('/');
  const { dialog } = await openMenu(page);
  await expect(
    dialog.getByRole('button', { name: 'Fechar menu' }),
  ).toBeFocused();
  await expect(page.locator('#main-content')).toHaveAttribute('inert', '');
});

test('Escape fecha e devolve foco ao acionador', async ({ page }) => {
  await page.goto('/');
  const { trigger, dialog } = await openMenu(page);
  await page.keyboard.press('Escape');
  await expect(dialog)
    .toBeHidden({ timeout: 5000 })
    .catch(async () => {
      await expect(
        page.getByRole('dialog', { name: 'Menu principal' }),
      ).toHaveCount(0);
    });
  await expect(trigger).toBeFocused();
});

test('Tab fica preso no modal', async ({ page }) => {
  await page.goto('/');
  const { dialog } = await openMenu(page);
  const closeButton = dialog.getByRole('button', { name: 'Fechar menu' });
  await expect(closeButton).toBeFocused();
  // Shift+Tab no primeiro elemento circula para o último, e Tab volta ao início.
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('link', { name: 'Quero conhecer' }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
});

test('clique no backdrop fecha o menu', async ({ page }) => {
  await page.goto('/');
  await openMenu(page);
  const backdrop = page.locator('.backdrop');
  await expect(backdrop).toBeVisible();
  // Clica na faixa visível do backdrop acima do painel (top 80) e abaixo da
  // faixa "Prévia" do preview (~36px): y=60 atinge backdrop nos dois modos.
  await backdrop.click({ position: { x: 5, y: 60 } });
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toHaveCount(0);
});

test('redimensionar 1099→1100 com foco no painel mantém foco visível', async ({
  page,
}) => {
  await page.goto('/ensino');
  await page.setViewportSize({ width: 1099, height: 844 });
  const { dialog } = await openMenu(page);
  await expect(
    dialog.getByRole('button', { name: 'Fechar menu' }),
  ).toBeFocused();
  await page.setViewportSize({ width: 1100, height: 900 });
  // C01: ao cruzar para desktop, painel fecha e foco vai para destino visível
  // (link ativo do DesktopNav quando o foco estava no painel).
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toHaveCount(0);
  await expect(
    page.locator('.desktop-nav a[aria-current="page"]'),
  ).toBeFocused();
  const active = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return 'BODY';
    const rect = (el as HTMLElement).getBoundingClientRect();
    const style = getComputedStyle(el as HTMLElement);
    const visible =
      rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    return visible
      ? `${el.tagName}:${((el as HTMLElement).textContent ?? '').trim().slice(0, 40)}`
      : `OCULTO:${el.tagName}`;
  });
  expect(active).not.toBe('BODY');
  expect(active.startsWith('OCULTO')).toBe(false);
});
