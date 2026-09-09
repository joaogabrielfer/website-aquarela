<!--
  PhotoGridIsland — ilha fina que combina LoadMore com miniaturas de foto.
  Dispara evento aquarela:lightbox com a lista COMPLETA de fotos do álbum
  (não apenas o slice visível), conforme R02.
-->
<script lang="ts">
  import LoadMore from './LoadMore.svelte';

  interface Photo {
    src: string;
    alt: string;
    caption?: string | null;
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
        class="photo-thumb"
        type="button"
        aria-label="Ampliar foto {i + 1} de {photos.length}: {photo.caption ||
          photo.alt}"
        on:click={() => openLightbox(i)}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          width="400"
          height="300"
          loading="lazy"
        />
      </button>
    {/each}
  </div>
</LoadMore>

<style>
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  .photo-thumb {
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--radius-card);
    overflow: hidden;
  }
  .photo-thumb img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    aspect-ratio: 4/3;
  }
  .photo-thumb:hover img {
    opacity: 0.9;
  }
  .photo-thumb:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px white;
  }
  @media (min-width: 768px) {
    .photo-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1100px) {
    .photo-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
