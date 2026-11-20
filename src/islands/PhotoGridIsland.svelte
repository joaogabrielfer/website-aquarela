<!--
  PhotoGridIsland — ilha fina que combina LoadMore com miniaturas de foto.
  Dispara evento aquarela:lightbox com a lista COMPLETA de fotos do álbum
  (não apenas o slice visível), conforme R02.
-->
<script lang="ts">
  import { focalPointStyle, responsiveSrcset } from '../lib/responsive-media';
  import LoadMore from './LoadMore.svelte';

  interface Photo {
    src: string;
    alt: string;
    caption?: string | null;
    width?: number;
    height?: number;
    focalPoint?: { x: number; y: number };
  }

  let {
    photos = [],
    initialCount = 12,
    batchSize = 12,
  }: {
    photos: Photo[];
    initialCount?: number;
    batchSize?: number;
  } = $props();

  const openLightbox = (index: number) => {
    window.dispatchEvent(
      new CustomEvent('aquarela:lightbox', {
        detail: { photos, index },
      }),
    );
  };
</script>

<LoadMore
  items={photos}
  {initialCount}
  {batchSize}
  buttonLabel="Carregar mais fotos"
  let:items
>
  <div class="photo-grid">
    {#each items as photo, i (photo.src + i)}
      <button
        class="photo-thumb media-frame"
        class:is-wide={i % 6 === 0}
        type="button"
        aria-label="Ampliar foto {i + 1} de {photos.length}: {photo.caption ||
          photo.alt}"
        on:click={() => openLightbox(i)}
      >
        <img
          src={photo.src}
          srcset={responsiveSrcset(photo.src, photo.width)}
          sizes="(min-width: 1100px) 33vw, (min-width: 768px) 50vw, 100vw"
          style={focalPointStyle(photo.focalPoint)}
          alt={photo.alt}
          width={photo.width ?? 400}
          height={photo.height ?? 300}
          loading="lazy"
          decoding="async"
        />
        <span class="thumb-expand" aria-hidden="true">↗</span>
      </button>
    {/each}
  </div>
</LoadMore>

<style>
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .photo-thumb {
    position: relative;
    padding: 0;
    border: 0;
    background: var(--surface-elevated);
    cursor: pointer;
    border-radius: var(--radius-media);
    overflow: hidden;
    aspect-ratio: 4 / 3;
  }

  .photo-thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 640ms var(--ease-expo);
  }

  .thumb-expand {
    position: absolute;
    right: 12px;
    bottom: 12px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(12, 27, 38, 0.78);
    backdrop-filter: blur(8px);
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 700;
    transition:
      background-color 240ms var(--ease),
      transform 240ms var(--ease);
  }

  .photo-thumb:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px #ffffff;
  }

  @media (hover: hover) {
    .photo-thumb:hover img {
      transform: scale(1.04);
    }
    .photo-thumb:hover .thumb-expand {
      background: var(--action-primary);
      transform: scale(1.06);
    }
  }

  @media (min-width: 768px) {
    .photo-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .photo-thumb.is-wide {
      grid-column: span 2;
      aspect-ratio: 16 / 9;
    }
  }

  @media (min-width: 1100px) {
    .photo-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
    }
    .photo-thumb.is-wide {
      grid-column: span 2;
      aspect-ratio: 16 / 9;
    }
  }
</style>
