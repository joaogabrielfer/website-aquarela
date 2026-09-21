const variantWidths = [480, 768, 1200, 1600] as const;

export const responsiveSrcset = (
  src: string | null | undefined,
  intrinsicWidth: number | null | undefined,
) => {
  if (!src || !intrinsicWidth) return undefined;
  const match = src.match(/^(.*)-1600\.webp$/);
  if (!match) return undefined;
  const prefix = match[1];
  return variantWidths
    .filter((width) => width <= intrinsicWidth)
    .map((width) => `${prefix}-${width}.webp ${width}w`)
    .join(', ');
};

export const focalPointStyle = (
  focalPoint: { x: number; y: number } | null | undefined,
) =>
  focalPoint
    ? `object-position: ${Number((focalPoint.x * 100).toFixed(2))}% ${Number(
        (focalPoint.y * 100).toFixed(2),
      )}%`
    : undefined;
