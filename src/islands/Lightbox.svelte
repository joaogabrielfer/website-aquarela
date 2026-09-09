<!--
  Lightbox (C08) — modal de visualização de fotos.

  Sobreposição com menu: MobileMenu.svelte e esta ilha publicam o estado
  aquarela:overlay-change. Cada ilha recusa abertura enquanto a outra camada
  está ativa, mantendo no máximo um dialog sobreposto.
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
  let bodyStyles: {
    overflow: string;
    paddingRight: string;
    position: string;
    top: string;
    width: string;
  } | null = null;
  let inertElements: Array<{
    element: HTMLElement;
    inert: boolean;
    attribute: boolean;
  }> = [];

  let dialogEl: HTMLDivElement | null = $state(null);
  let hostEl: HTMLDivElement | null = $state(null);
  let closeButtonEl: HTMLButtonElement | null = $state(null);
  let imgEl: HTMLImageElement | null = $state(null);
  let imgError = $state(false);
  let retryToken = $state(0);
  let menuOpen = $state(false);

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

  const setBackgroundInert = (value: boolean) => {
    if (value) {
      // The island is wrapped by Astro in a direct <astro-island> child of
      // main. Keep that host (and this always-mounted inner host) active.
      const main = document.querySelector<HTMLElement>('#main-content');
      const islandHost = hostEl?.closest<HTMLElement>('#main-content > *');
      const candidates = [
        document.querySelector<HTMLElement>('#site-header'),
        ...(main ? Array.from(main.children) : []),
        document.querySelector<HTMLElement>('.site-footer'),
      ].filter(
        (element, index, all): element is HTMLElement =>
          element !== null &&
          element !== islandHost &&
          all.indexOf(element) === index,
      );
      inertElements = candidates.map((element) => {
        const previous = Boolean(
          (element as HTMLElement & { inert?: boolean }).inert,
        );
        const attribute = element.hasAttribute('inert');
        element.setAttribute('inert', '');
        (element as HTMLElement & { inert?: boolean }).inert = true;
        return { element, inert: previous, attribute };
      });
      return;
    }
    for (const { element, inert, attribute } of inertElements) {
      if (attribute) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
      (element as HTMLElement & { inert?: boolean }).inert = inert;
    }
    inertElements = [];
  };

  const lockBody = () => {
    scrollY = window.scrollY;
    bodyStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const unlockBody = () => {
    const saved = bodyStyles;
    document.body.style.overflow = saved?.overflow ?? '';
    document.body.style.paddingRight = saved?.paddingRight ?? '';
    document.body.style.position = saved?.position ?? '';
    document.body.style.top = saved?.top ?? '';
    document.body.style.width = saved?.width ?? '';
    bodyStyles = null;
    window.scrollTo(0, scrollY);
  };

  const openLightbox = (newPhotos: Photo[], index: number) => {
    if (menuOpen || document.querySelector('#mobile-menu')) return;
    if (open) {
      photos = newPhotos;
      currentIndex = Math.max(0, Math.min(index, newPhotos.length - 1));
      imgError = false;
      retryToken += 1;
      return;
    }
    photos = newPhotos;
    currentIndex = Math.max(0, Math.min(index, newPhotos.length - 1));
    imgError = false;
    retryToken = 0;
    triggerEl = document.activeElement as HTMLElement | null;
    lockBody();
    setBackgroundInert(true);
    open = true;
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'lightbox', open: true },
      }),
    );
    // Focus close button after DOM update
    requestAnimationFrame(() => {
      closeButtonEl?.focus();
    });
  };

  const releaseOverlay = () => {
    setBackgroundInert(false);
    unlockBody();
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'lightbox', open: false },
      }),
    );
  };

  const closeLightbox = () => {
    if (!open) return;
    open = false;
    releaseOverlay();
    setTimeout(() => {
      if (triggerEl && typeof triggerEl.focus === 'function') triggerEl.focus();
    }, 0);
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
      e.preventDefault();
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
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
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

  const handleImgError = () => {
    imgError = true;
  };

  const handleRetry = () => {
    imgError = false;
    retryToken += 1;
  };

  onMount(() => {
    const handler = ((e: CustomEvent) => {
      const detail = e.detail;
      const newPhotos = detail?.photos;
      if (Array.isArray(newPhotos) && newPhotos.length > 0) {
        const index = Number.isInteger(detail?.index) ? detail.index : 0;
        openLightbox(newPhotos as Photo[], index);
      }
    }) as EventListener;
    window.addEventListener('aquarela:lightbox', handler);
    const overlayChange = ((
      event: CustomEvent<{ type: string; open: boolean }>,
    ) => {
      if (event.detail?.type === 'menu') menuOpen = event.detail.open;
    }) as EventListener;
    window.addEventListener('aquarela:overlay-change', overlayChange);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('aquarela:lightbox', handler);
      window.removeEventListener('aquarela:overlay-change', overlayChange);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  onDestroy(() => {
    if (open) {
      open = false;
      releaseOverlay();
    }
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="lightbox-host" bind:this={hostEl}>
  {#if open}
    <div
      class="lightbox-backdrop"
      on:click|self={closeLightbox}
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
          <div class="lightbox-counter" role="status" aria-live="polite">
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
            {#key `${currentIndex}-${retryToken}`}
              <img
                class="lightbox-img"
                src={currentPhoto?.src}
                alt={currentPhoto?.alt || ''}
                width={currentPhoto?.width}
                height={currentPhoto?.height}
                bind:this={imgEl}
                on:error={handleImgError}
              />
            {/key}
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
</div>

<style>
  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-lightbox);
    background: rgb(0 0 0 / 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: max(16px, env(safe-area-inset-top))
      max(16px, env(safe-area-inset-right))
      max(16px, env(safe-area-inset-bottom))
      max(16px, env(safe-area-inset-left));
    animation: lightbox-in var(--duration-overlay) var(--ease);
  }
  @media (min-width: 768px) {
    .lightbox-backdrop {
      padding: max(24px, env(safe-area-inset-top))
        max(24px, env(safe-area-inset-right))
        max(24px, env(safe-area-inset-bottom))
        max(24px, env(safe-area-inset-left));
    }
  }
  .lightbox-dialog {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    max-height: 100%;
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
    padding: 10px 16px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
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
    max-height: min(20vh, 160px);
    overflow-y: auto;
    padding: var(--space-2) 0;
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
  .lightbox-retry:focus-visible {
    outline: 3px solid white;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--text-ink);
  }

  @media (hover: hover) {
    .lightbox-close:hover,
    .lightbox-retry:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .lightbox-nav:hover:not(:disabled) {
      background: var(--surface-paper);
    }
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
    .lightbox-media {
      flex: 0 1 60vh;
    }
  }
</style>
