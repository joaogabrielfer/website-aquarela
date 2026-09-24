import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const isCfPreview =
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main';
const site = isCfPreview
  ? process.env.CF_PAGES_URL || process.env.SITE_URL
  : process.env.SITE_URL;
const preview =
  process.env.APP_BUILD_MODE === 'editorial-preview' ||
  (process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main');

const publicMediaGuard = {
  name: 'aquarela-public-media-guard',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (process.env.APP_BUILD_MODE === 'editorial-preview') return;

      const outputMediaDir = fileURLToPath(new URL('media/', dir));
      if (!fs.existsSync(outputMediaDir)) return;

      const records = yaml.load(
        fs.readFileSync(path.resolve('content/media.yaml'), 'utf8'),
      );
      const allowedPrefixes = new Set(
        (Array.isArray(records) ? records : [])
          .filter(
            (record) =>
              record?.review?.status === 'approved' &&
              record?.usageApproved === true,
          )
          .map((record) =>
            path
              .basename(record.src, path.extname(record.src))
              .replace(/-1600$/, ''),
          ),
      );

      for (const file of fs.readdirSync(outputMediaDir)) {
        const stem = path.basename(file, path.extname(file));
        const prefix = stem.replace(/-(480|768|1200|1600)$/, '');
        if (!allowedPrefixes.has(prefix)) {
          fs.rmSync(path.join(outputMediaDir, file));
        }
      }

      if (fs.readdirSync(outputMediaDir).length === 0) {
        fs.rmdirSync(outputMediaDir);
      }
    },
  },
};

export default defineConfig({
  output: 'static',
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    svelte(),
    publicMediaGuard,
    ...(site && !preview
      ? [sitemap({ filter: (page) => !page.endsWith('/404') })]
      : []),
  ],
});
