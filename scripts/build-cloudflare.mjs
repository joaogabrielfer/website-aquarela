import { spawnSync } from 'node:child_process';

export const buildModeForBranch = (branch = '') => {
  const normalized = branch.trim().toLowerCase();
  return normalized === 'preview' ||
    normalized.startsWith('editorial') ||
    normalized.startsWith('phase')
    ? 'editorial-preview'
    : 'public';
};

const branch = process.env.CF_PAGES_BRANCH ?? '';
const mode = buildModeForBranch(branch);
const script = mode === 'editorial-preview' ? 'build:preview' : 'build';

console.log(
  `Cloudflare Pages: branch "${branch || '(não informada)'}" → ${mode}`,
);

const result = spawnSync(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['run', script],
  { stdio: 'inherit', env: process.env },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
