import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, IS_CF_PREVIEW } from './src/lib/env.ts';

export default defineConfig({
  output: 'static',
  site: SITE_URL ?? undefined,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    svelte(),
    ...(SITE_URL && !IS_CF_PREVIEW
      ? [sitemap({ filter: (page) => !page.endsWith('/404') })]
      : []),
  ],
});
