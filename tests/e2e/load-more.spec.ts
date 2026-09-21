import { test, expect } from '@playwright/test';

test('paginação preserva itens, foco e anúncio entre lotes', async ({
  page,
}) => {
  await page.goto('/qa-fixtures/load-more');
  const list = page.getByRole('list', { name: 'Itens sintéticos' });
  const items = list.getByRole('listitem');
  await expect(items).toHaveCount(2);
  await expect(items.first()).toHaveText('Item sintético 1');

  const button = page.getByRole('button', { name: 'Carregar mais' });
  await button.click();
  await expect(items).toHaveCount(4);
  await expect(items.first()).toHaveText('Item sintético 1');
  await expect(button).toBeFocused();
  await expect(page.locator('.sr-only[role="status"]')).toHaveText(
    '2 itens adicionados',
  );

  await button.click();
  await expect(items).toHaveCount(5);
  await expect(items.last()).toHaveText('Item sintético 5');
  const done = page.getByText('Todos os itens foram exibidos');
  await expect(done).toBeVisible();
  await expect(done).toBeFocused();
  await expect(page.locator('.sr-only[role="status"]')).toHaveText(
    '1 item adicionado',
  );
});
