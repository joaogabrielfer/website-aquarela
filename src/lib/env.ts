export type BuildMode = 'public' | 'editorial-preview' | 'release';
const requestedMode = process.env.APP_BUILD_MODE;
if (
  requestedMode !== undefined &&
  !['public', 'editorial-preview', 'release'].includes(requestedMode)
) {
  throw new Error(
    `APP_BUILD_MODE inválido: "${requestedMode}". Use public, editorial-preview ou release.`,
  );
}
export const BUILD_MODE: BuildMode =
  requestedMode === 'editorial-preview' || requestedMode === 'release'
    ? requestedMode
    : 'public';
const isCfPreview =
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main';
export const SITE_URL = isCfPreview
  ? (process.env.CF_PAGES_URL ?? process.env.SITE_URL ?? null)
  : (process.env.SITE_URL ?? null);
export const IS_CF_PREVIEW = Boolean(
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main',
);
export const IS_PREVIEW = BUILD_MODE === 'editorial-preview' || IS_CF_PREVIEW;
