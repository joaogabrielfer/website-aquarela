import { defineConfig } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4311);
const directory = process.env.E2E_DIR ?? 'dist/e2e';
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ?? process.env.CHROMIUM_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  outputDir: 'test-results',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(chromiumPath
      ? { launchOptions: { executablePath: chromiumPath } }
      : {}),
  },
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: `node scripts/qa/serve-e2e.mjs --dir ${directory} --port ${port}`,
          port,
          reuseExistingServer: true,
          timeout: 30_000,
        },
      }),
});
