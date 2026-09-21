// scripts/qa/build-e2e.mjs
// Builds isolados para e2e (Fase 3). Nunca toca em `dist/` principal:
// usa --outDir isolado e roda os dois modos em sequência (sem concorrência).
// Uso: node scripts/qa/build-e2e.mjs [--public-dir X] [--preview-dir Y]
// Envs: E2E_PUBLIC_DIR, E2E_PREVIEW_DIR.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  if (i !== -1 && args[i + 1]) return args[i + 1];
  return fallback;
};

const publicDir =
  getArg('--public-dir', process.env.E2E_PUBLIC_DIR) ?? 'dist/e2e-public';
const previewDir =
  getArg('--preview-dir', process.env.E2E_PREVIEW_DIR) ?? 'dist/e2e-preview';

const run = (cmd, env) => {
  console.log(`[build-e2e] ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
};

const fixtureDir = path.resolve('src/pages/qa-fixtures');
const fixturePage = path.join(fixtureDir, 'load-more.astro');
const fixtureSource = path.resolve(
  'tests/fixtures/pages/load-more.astro.fixture',
);

if (fs.existsSync(fixturePage)) {
  throw new Error(`[build-e2e] destino de fixture já existe: ${fixturePage}`);
}

fs.mkdirSync(fixtureDir, { recursive: true });
fs.copyFileSync(fixtureSource, fixturePage);

// Sequencial de propósito: dois `astro build` concorrentes disputam cache
// e o `dist/` principal deve permanecer intacto para o fluxo de release.
try {
  run(`pnpm exec astro build --outDir ${publicDir}`, {
    APP_BUILD_MODE: 'public',
  });
  run(`pnpm exec astro build --outDir ${previewDir}`, {
    APP_BUILD_MODE: 'editorial-preview',
  });
} finally {
  fs.rmSync(fixturePage, { force: true });
  try {
    fs.rmdirSync(fixtureDir);
  } catch {
    // Preserve the directory if another reviewed file exists there.
  }
}

console.log(`[build-e2e] ok: ${publicDir} (public), ${previewDir} (preview)`);
