import { test, expect } from '@playwright/test';

// B05 itens 1/4: sem overflow horizontal; B04 proíbe mascarar com
// overflow-x:hidden no body — o teste mede scrollWidth real.
const viewports = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`home sem overflow em ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        bodyOverflowX: getComputedStyle(document.body).overflowX,
      };
    });
    expect(overflow.bodyOverflowX).not.toBe('hidden');
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}

test('rotas principais sem overflow em 390x844 e 1440x900', async ({
  page,
}) => {
  const routes = [
    '/',
    '/ensino',
    '/nosso-espaco',
    '/aprovacoes',
    '/atividades',
    '/galeria',
    '/visite',
  ];
  for (const size of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        overflow.scrollWidth,
        `${route} em ${size.width}x${size.height}`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }
  }
});
