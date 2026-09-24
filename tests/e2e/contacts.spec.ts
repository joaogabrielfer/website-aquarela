import { test, expect } from '@playwright/test';

// R02/C09: contatos condicionais — omitir sem inventar, nunca botão
// desabilitado para contato desconhecido e contexto de interesse no SSG.
test('visite omite contatos ausentes em vez de desabilitar', async ({
  page,
}) => {
  await page.goto('/visite');
  await expect(
    page.getByText('Converse com a equipe para combinar sua visita.'),
  ).toBeVisible();
  const disabledContacts = await page
    .locator(
      '.contact-panel button[disabled], .contact-panel a[aria-disabled="true"]',
    )
    .count();
  expect(disabledContacts).toBe(0);
  const disabledByText = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, a')];
    return els
      .filter((el) => {
        const text = (el.textContent ?? '').toLowerCase();
        const mentionsContact =
          text.includes('whatsapp') ||
          text.includes('ligar') ||
          text.includes('como chegar');
        return (
          mentionsContact &&
          (el.hasAttribute('disabled') ||
            el.getAttribute('aria-disabled') === 'true')
        );
      })
      .map((el) => el.textContent?.trim() ?? el.tagName);
  });
  expect(disabledByText).toEqual([]);
});

test('interesse válido atualiza contexto e mensagem do WhatsApp no runtime', async ({
  page,
}) => {
  await page.goto('/visite?interesse=educacao-infantil');
  await expect(page.locator('.interest-label')).toHaveText(
    'Sobre: Educação Infantil',
  );
  const whatsapp = page.getByRole('link', { name: 'Conversar no WhatsApp' });
  if ((await whatsapp.count()) > 0) {
    const href = await whatsapp.getAttribute('href');
    expect(decodeURIComponent(href ?? '')).toContain(
      'saber mais sobre Educação Infantil.',
    );
  }
});

for (const query of [
  'interesse=desconhecido',
  'interesse=ensino-medio&interesse=ensino-medio',
  'interesse=',
]) {
  test(`interesse inválido permanece genérico: ${query}`, async ({ page }) => {
    await page.goto(`/visite?${query}`);
    await expect(page.locator('.contact-panel-interest')).toBeHidden();
    const whatsapp = page.getByRole('link', {
      name: 'Conversar no WhatsApp',
    });
    if ((await whatsapp.count()) > 0) {
      const href = await whatsapp.getAttribute('href');
      expect(decodeURIComponent(href ?? '')).toContain(
        'Gostaria de combinar uma visita ao Aquarela.',
      );
    }
  });
}

test('links de contato usam formatos válidos quando presentes', async ({
  page,
}) => {
  await page.goto('/visite');
  const telHrefs: string[] = await page
    .locator('a[href^="tel:"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  for (const href of telHrefs) {
    expect(href).toMatch(/^tel:\+\d{10,15}$/);
  }
  const waHrefs: string[] = await page
    .locator('a[href*="wa.me"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  for (const href of waHrefs) {
    expect(href).toMatch(/^https:\/\/wa\.me\/\d{10,15}\?text=/);
    expect(href).not.toContain('+');
  }
  const mapHrefs: string[] = await page
    .locator('a:has-text("Como chegar")')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  for (const href of mapHrefs) {
    expect(href.startsWith('https://')).toBe(true);
    expect(href).not.toMatch(/^javascript:/i);
  }
});
