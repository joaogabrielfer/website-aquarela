import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

const isCfPreview =
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main';
const site = isCfPreview
  ? process.env.CF_PAGES_URL || process.env.SITE_URL
  : process.env.SITE_URL;
const preview =
  process.env.APP_BUILD_MODE === 'editorial-preview' ||
  (process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main');

export default defineConfig({
  output: 'static',
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    svelte(),
    ...(site && !preview
      ? [sitemap({ filter: (page) => !page.endsWith('/404') })]
      : []),
  ],
});
