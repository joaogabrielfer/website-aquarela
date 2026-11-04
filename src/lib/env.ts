// O conteúdo é o mesmo em todas as branches; apenas URL e indexação variam.
export const IS_CF_PREVIEW = Boolean(
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main',
);
export const SITE_URL = IS_CF_PREVIEW
  ? (process.env.CF_PAGES_URL ?? process.env.SITE_URL ?? null)
  : (process.env.SITE_URL ?? null);
export const ENABLE_SMOOTH_SCROLL =
  process.env.ENABLE_SMOOTH_SCROLL !== 'false';
