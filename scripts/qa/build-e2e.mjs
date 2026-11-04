// Um build isolado com uma rota sintética de paginação, sem alterar dist/ de produção.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const output = process.env.E2E_DIR ?? 'dist/e2e';
const fixtureDir = path.resolve('src/pages/qa-fixtures');
const fixturePage = path.join(fixtureDir, 'load-more.astro');
if (fs.existsSync(fixturePage))
  throw new Error(`Fixture já existe: ${fixturePage}`);
fs.mkdirSync(fixtureDir, { recursive: true });
fs.copyFileSync('tests/fixtures/pages/load-more.astro.fixture', fixturePage);
try {
  execFileSync('pnpm', ['exec', 'astro', 'build', '--outDir', output], {
    stdio: 'inherit',
  });
} finally {
  fs.rmSync(fixturePage);
  if (fs.readdirSync(fixtureDir).length === 0) fs.rmdirSync(fixtureDir);
}
