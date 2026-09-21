import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  focalPointStyle,
  responsiveSrcset,
} from '../../src/lib/responsive-media';

const mediaDir = path.resolve(process.cwd(), 'public/media');

describe('responsiveSrcset', () => {
  it('produz todas as variantes convencionadas para um hero completo', () => {
    expect(responsiveSrcset('/media/hero-colegio-1600.webp', 1600)).toBe(
      '/media/hero-colegio-480.webp 480w, ' +
        '/media/hero-colegio-768.webp 768w, ' +
        '/media/hero-colegio-1200.webp 1200w, ' +
        '/media/hero-colegio-1600.webp 1600w',
    );
  });

  it('limita variantes à largura intrínseca sem inventar uma maior', () => {
    expect(responsiveSrcset('/media/hero-colegio-1600.webp', 1200)).toBe(
      '/media/hero-colegio-480.webp 480w, ' +
        '/media/hero-colegio-768.webp 768w, ' +
        '/media/hero-colegio-1200.webp 1200w',
    );
  });

  it('retorna fallback ausente fora da convenção ou sem fonte utilizável', () => {
    expect(responsiveSrcset('/media/hero-colegio.webp', 1600)).toBeUndefined();
    expect(
      responsiveSrcset('/media/hero-colegio-1600.jpg', 1600),
    ).toBeUndefined();
    expect(responsiveSrcset(null, 1600)).toBeUndefined();
    expect(
      responsiveSrcset('/media/hero-colegio-1600.webp', null),
    ).toBeUndefined();
    expect(
      responsiveSrcset('/media/hero-colegio-1600.webp', 0),
    ).toBeUndefined();
  });
});

describe('focalPointStyle', () => {
  it('formata o ponto focal em porcentagens estáveis com duas casas', () => {
    expect(focalPointStyle({ x: 0.123456, y: 0.987654 })).toBe(
      'object-position: 12.35% 98.77%',
    );
    expect(focalPointStyle({ x: 0, y: 1 })).toBe('object-position: 0% 100%');
  });

  it('não cria estilo quando o ponto focal está ausente', () => {
    expect(focalPointStyle(null)).toBeUndefined();
    expect(focalPointStyle(undefined)).toBeUndefined();
  });
});

describe('artefatos responsivos públicos do hero', () => {
  const widths = [480, 768, 1200, 1600] as const;
  const expectedHeights = new Map([
    [480, 270],
    [768, 432],
    [1200, 675],
    [1600, 900],
  ]);

  it('contém as quatro larguras com dimensões 16:9 esperadas', async () => {
    const metadata = await Promise.all(
      widths.map(async (width) => {
        const file = path.join(mediaDir, `hero-colegio-${width}.webp`);
        expect(fs.existsSync(file), `arquivo ausente: ${file}`).toBe(true);
        return { width, metadata: await sharp(file).metadata() };
      }),
    );

    for (const { width, metadata: image } of metadata) {
      expect(image.format).toBe('webp');
      expect(image.width).toBe(width);
      expect(image.height).toBe(expectedHeights.get(width));
    }
  });
});
