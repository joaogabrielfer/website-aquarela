<!--
  AlbumGridIsland — ilha fina que combina LoadMore com AlbumCards.
  A primeira leva é renderizada no servidor (Svelte SSR no build).
-->
<script lang="ts">
  import LoadMore from './LoadMore.svelte';

  interface Album {
    slug: string;
    title: string;
    date: string;
    category: string;
    coverUrl?: string | null;
    coverAlt?: string;
  }

  let {
    albums = [],
    initialCount = 9,
    batchSize = 9,
  }: {
    albums: Album[];
    initialCount?: number;
    batchSize?: number;
  } = $props();
</script>

<LoadMore
  items={albums}
  {initialCount}
  {batchSize}
  buttonLabel="Carregar mais álbuns"
  let:items
>
  <div class="album-grid">
    {#each items as album (album.slug)}
      <a href={`/galeria/${album.slug}`} class="album-card">
        {#if album.coverUrl}
          <div class="card-media">
            <img
              src={album.coverUrl}
              alt={album.coverAlt || album.title}
              width="400"
              height="300"
              loading="lazy"
            />
          </div>
        {/if}
        <div class="card-body">
          <h3 class="card-title">{album.title}</h3>
          <p class="card-meta">{album.date} · {album.category}</p>
        </div>
      </a>
    {/each}
  </div>
</LoadMore>

<style>
  .album-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  .album-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
  }
  .album-card:hover,
  .album-card:focus-within {
    box-shadow: var(--shadow);
    border-color: var(--brand-navy);
  }
  .album-card:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px white;
  }
  .card-media {
    overflow: hidden;
  }
  .card-media img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    aspect-ratio: 4/3;
  }
  .card-body {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .card-title {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.2;
  }
  .card-meta {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }
  @media (min-width: 768px) {
    .album-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1100px) {
    .album-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 767px) {
    .card-body {
      padding: var(--space-5);
    }
  }
</style>
