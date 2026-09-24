import { defineConfig } from '@playwright/test';

// Fase 3 — Playwright sobre builds estáticos isolados (AQ-WEB-1.1.4).
// Nunca usa os HTMLs do `dist/` principal: os builds e2e vão para
// subdiretórios isolados `dist/e2e-public` e `dist/e2e-preview`
// (cobertos pelo ignore de `dist/` no tsconfig/eslint/gitignore).
// Servidores com portas separadas para público e editorial-preview.
// Override de executable via env (ex.: PLAYWRIGHT_CHROMIUM_PATH); nenhum
// caminho pessoal é fixado no repo.
const publicPort = Number(process.env.E2E_PUBLIC_PORT ?? 4311);
const previewPort = Number(process.env.E2E_PREVIEW_PORT ?? 4312);
const publicDir = process.env.E2E_PUBLIC_DIR ?? 'dist/e2e-public';
const previewDir = process.env.E2E_PREVIEW_DIR ?? 'dist/e2e-preview';
const publicUrl =
  process.env.PLAYWRIGHT_PUBLIC_URL ?? `http://127.0.0.1:${publicPort}`;
const previewUrl =
  process.env.PLAYWRIGHT_PREVIEW_URL ?? `http://127.0.0.1:${previewPort}`;
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  process.env.CHROMIUM_PATH ??
  undefined;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  outputDir: 'test-results',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(chromiumPath
      ? { launchOptions: { executablePath: chromiumPath } }
      : {}),
  },
  projects: [
    { name: 'public', use: { baseURL: publicUrl } },
    { name: 'preview', use: { baseURL: previewUrl } },
  ],
  webServer: [
    {
      command: `node scripts/qa/serve-e2e.mjs --dir ${publicDir} --port ${publicPort}`,
      port: publicPort,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: `node scripts/qa/serve-e2e.mjs --dir ${previewDir} --port ${previewPort}`,
      port: previewPort,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
