<!--
  Lightbox (C08) — modal de visualização de fotos.

  Sobreposição com menu: o menu mobile é controlado por MobileMenu.svelte,
  que bloqueia body/inert ao abrir. Enquanto o menu está aberto, o fundo
  fica inerte e coberto pelo backdrop, impedindo que qualquer botão de
  foto dispare o evento aquarela:lightbox. Portanto, não existe cenário
  de menu + lightbox simultâneos e não precisamos de store compartilhado.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Photo {
    src: string;
    alt: string;
    caption?: string | null;
    width?: number;
    height?: number;
  }

  let photos: Photo[] = $state([]);
  let currentIndex = $state(0);
  let open = $state(false);
  let triggerEl: HTMLElement | null = $state(null);
  let scrollY = 0;
  let scrollbarWidth = 0;

  let dialogEl: HTMLDivElement | null = $state(null);
  let closeButtonEl: HTMLButtonElement | null = $state(null);
  let imgEl: HTMLImageElement | null = $state(null);
  let imgError = $state(false);
  let statusEl: HTMLDivElement | null = $state(null);

  const currentPhoto = $derived(photos[currentIndex] ?? null);
  const total = $derived(photos.length);
  const canPrev = $derived(currentIndex > 0);
  const canNext = $derived(currentIndex < total - 1);

  // Preload adjacent images
  $effect(() => {
    if (!open || !currentPhoto) return;
    const toPreload: string[] = [];
    if (canNext && photos[currentIndex + 1]) {
      toPreload.push(photos[currentIndex + 1].src);
    }
    if (canPrev && photos[currentIndex - 1]) {
      toPreload.push(photos[currentIndex - 1].src);
    }
    for (const src of toPreload) {
      const img = new Image();
      img.src = src;
    }
  });

  // Announce navigation via role=status (polite)
  $effect(() => {
    if (open && statusEl && currentPhoto) {
      // Trigger re-announcement by updating text content
      const text = `${currentIndex + 1} de ${total}`;
      statusEl.textContent = '';
      requestAnimationFrame(() => {
        if (statusEl) statusEl.textContent = text;
      });
    }
  });

  const openLightbox = (newPhotos: Photo[], index: number) => {
    photos = newPhotos;
    currentIndex = index;
    imgError = false;
    triggerEl = document.activeElement as HTMLElement | null;
    scrollY = window.scrollY;
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    // Make header/main/footer inert
    document.querySelector('#site-header')?.setAttribute('inert', '');
    document.querySelector('#main-content')?.setAttribute('inert', '');
    document.querySelector('.site-footer')?.setAttribute('inert', '');
    open = true;
    // Focus close button after DOM update
    requestAnimationFrame(() => {
      closeButtonEl?.focus();
    });
  };

  const closeLightbox = () => {
    open = false;
    // Restore body
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.querySelector('#site-header')?.removeAttribute('inert');
    document.querySelector('#main-content')?.removeAttribute('inert');
    document.querySelector('.site-footer')?.removeAttribute('inert');
    // Restore focus to trigger
    if (triggerEl && typeof triggerEl.focus === 'function') {
      triggerEl.focus();
    }
  };

  const prev = () => {
    if (canPrev) {
      imgError = false;
      currentIndex--;
    }
  };

  const next = () => {
    if (canNext) {
      imgError = false;
      currentIndex++;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
    if (e.key === 'Tab') {
      // Focus trap within dialog
      const dialog = dialogEl;
      if (!dialog) return;
      const focusable = [
        closeButtonEl,
        ...Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href]',
          ),
        ),
      ].filter(Boolean) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    // Close only if clicking the backdrop itself, not the image or controls
    if ((e.target as HTMLElement).classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  };

  const handleImgError = () => {
    imgError = true;
  };

  const handleRetry = () => {
    imgError = false;
    // Force re-render of the image by updating the key
    if (imgEl && currentPhoto) {
      imgEl.src = currentPhoto.src;
    }
  };

  onMount(() => {
    const handler = ((e: CustomEvent) => {
      const { photos: newPhotos, index = 0 } = e.detail;
      if (newPhotos && newPhotos.length > 0) {
        openLightbox(newPhotos, index);
      }
    }) as EventListener;
    window.addEventListener('aquarela:lightbox', handler);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('aquarela:lightbox', handler);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="lightbox-backdrop"
    on:click={handleBackdropClick}
    role="presentation"
  >
    <div
      class="lightbox-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de fotos"
      bind:this={dialogEl}
    >
      <!-- Top bar -->
      <div class="lightbox-topbar">
        <div
          class="lightbox-counter"
          role="status"
          aria-live="polite"
          bind:this={statusEl}
        >
          {currentIndex + 1} de {total}
        </div>
        <button
          class="lightbox-close btn focus-on-navy"
          type="button"
          on:click={closeLightbox}
          bind:this={closeButtonEl}
        >
          Fechar
        </button>
      </div>

      <!-- Media area -->
      <div class="lightbox-media">
        {#if !imgError}
          <img
            class="lightbox-img"
            src={currentPhoto?.src}
            alt={currentPhoto?.alt || ''}
            bind:this={imgEl}
            on:error={handleImgError}
          />
        {:else}
          <div class="lightbox-error">
            <p class="lightbox-error-text">
              Não foi possível carregar esta foto
            </p>
            <button
              class="lightbox-retry btn--secondary"
              type="button"
              on:click={handleRetry}
            >
              Tentar novamente
            </button>
          </div>
        {/if}

        <!-- Navigation buttons -->
        <button
          class="lightbox-nav lightbox-prev focus-on-navy"
          type="button"
          aria-label="Foto anterior"
          disabled={!canPrev}
          on:click={prev}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          class="lightbox-nav lightbox-next focus-on-navy"
          type="button"
          aria-label="Próxima foto"
          disabled={!canNext}
          on:click={next}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <!-- Caption -->
      {#if currentPhoto?.caption || currentPhoto?.alt}
        <div class="lightbox-caption">
          <p>{currentPhoto?.caption || currentPhoto?.alt}</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-lightbox);
    background: rgb(0 0 0 / 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: lightbox-in var(--duration-overlay) var(--ease);
  }
  @media (min-width: 768px) {
    .lightbox-backdrop {
      padding: 24px;
    }
  }
  .lightbox-dialog {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
    height: 100vh; /* fallback */
    max-height: 100dvh;
    max-height: 100vh;
  }
  .lightbox-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    flex-shrink: 0;
  }
  .lightbox-counter {
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .lightbox-close {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: var(--radius-pill);
    color: white;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
  }
  .lightbox-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .lightbox-close:focus-visible {
    outline: 3px solid white;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--text-ink);
  }
  .lightbox-media {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 0;
    overflow: hidden;
  }
  .lightbox-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius-media);
    user-select: none;
    -webkit-user-drag: none;
  }
  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-control);
    cursor: pointer;
    font-size: 1.5rem;
    color: var(--text-ink);
    z-index: 1;
  }
  .lightbox-nav:hover:not(:disabled) {
    background: var(--surface-paper);
  }
  .lightbox-nav:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .lightbox-nav:focus-visible {
    outline: 3px solid white;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--text-ink);
  }
  .lightbox-prev {
    left: 8px;
  }
  .lightbox-next {
    right: 8px;
  }
  .lightbox-caption {
    flex-shrink: 0;
    max-height: 80px;
    overflow-y: auto;
    padding: 8px 0;
  }
  .lightbox-caption p {
    margin: 0;
    color: white;
    font-size: 0.875rem;
    text-align: center;
    line-height: 1.5;
  }
  .lightbox-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    color: white;
    text-align: center;
    padding: var(--space-8);
  }
  .lightbox-error-text {
    margin: 0;
    font-size: 1rem;
  }
  .lightbox-retry {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-pill);
    color: white;
    padding: 10px 20px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
  }
  .lightbox-retry:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .lightbox-retry:focus-visible {
    outline: 3px solid white;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--text-ink);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .lightbox-backdrop {
      animation: none;
    }
  }

  @keyframes lightbox-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Landscape low height adjustments */
  @media (max-height: 500px) and (orientation: landscape) {
    .lightbox-caption {
      max-height: 50px;
    }
    .lightbox-img {
      max-height: 60vh;
    }
  }
</style>
