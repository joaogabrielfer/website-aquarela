<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  export let items: readonly { label: string; href: string }[] = [];
  let open = false;
  let trigger: HTMLButtonElement | undefined;
  let panel: HTMLElement | undefined;
  let mql: MediaQueryList | undefined;
  let lightboxOpen = false;
  let panelTop = 80;
  let panelTopFrame = 0;

  // The island is rendered inside the header, so inert only its background
  // siblings; inerting #site-header would also inert this open panel.
  const backgroundSelectors = [
    '#site-header .logo-link',
    '#site-header .desktop-nav',
    '#main-content',
    '.site-footer',
  ];
  let inertElements: Array<{
    element: HTMLElement;
    inert: boolean;
    attribute: boolean;
  }> = [];
  let bodyStyles: {
    overflow: string;
    paddingRight: string;
    position: string;
    top: string;
    width: string;
  } | null = null;
  let scrollY = 0;

  const setBackgroundInert = (value: boolean) => {
    if (value) {
      inertElements = backgroundSelectors
        .map((selector) => document.querySelector<HTMLElement>(selector))
        .filter((element): element is HTMLElement => element !== null)
        .map((element) => {
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
    document.body.style.paddingRight = scrollbarWidth
      ? `${scrollbarWidth}px`
      : bodyStyles.paddingRight;
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

  const releaseOverlay = () => {
    setBackgroundInert(false);
    unlockBody();
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'menu', open: false },
      }),
    );
  };

  const updatePanelTop = () => {
    if (!open) return;
    const header = document.querySelector<HTMLElement>('#site-header');
    const bottom = header?.getBoundingClientRect().bottom;
    panelTop =
      bottom !== undefined && Number.isFinite(bottom)
        ? Math.max(0, bottom)
        : 80;
  };

  const schedulePanelTopUpdate = () => {
    if (!open || panelTopFrame) return;
    panelTopFrame = requestAnimationFrame(() => {
      panelTopFrame = 0;
      updatePanelTop();
    });
  };

  const close = (restore = true, navigate = false) => {
    if (!open) return;
    open = false;
    releaseOverlay();
    if (restore && !navigate) setTimeout(() => trigger?.focus(), 0);
  };

  const handleDesktopCrossover = () => {
    if (open) {
      const focusInPanel = panel?.contains(document.activeElement);
      close(false, true);
      if (focusInPanel) {
        setTimeout(() => {
          const activeLink = document.querySelector<HTMLElement>(
            '.desktop-nav a.active',
          );
          activeLink?.focus();
        }, 0);
      }
    }
  };

  const keydown = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Tab') {
      const els = [
        ...(panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []),
      ];
      if (els.length === 0) return;
      if (event.shiftKey && document.activeElement === els[0]) {
        event.preventDefault();
        els.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === els.at(-1)) {
        event.preventDefault();
        els[0]?.focus();
      }
    }
  };

  const show = () => {
    if (open || lightboxOpen || document.querySelector('.lightbox-root'))
      return;
    open = true;
    lockBody();
    setBackgroundInert(true);
    updatePanelTop();
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'menu', open: true },
      }),
    );
    setTimeout(() => panel?.querySelector('button')?.focus(), 0);
  };

  onMount(() => {
    document.addEventListener('keydown', keydown);
    const overlayChange = ((
      event: CustomEvent<{ type: string; open: boolean }>,
    ) => {
      if (event.detail?.type === 'lightbox') lightboxOpen = event.detail.open;
    }) as EventListener;
    window.addEventListener('aquarela:overlay-change', overlayChange);
    mql = window.matchMedia('(min-width: 1100px)');
    mql.addEventListener('change', handleDesktopCrossover);
    window.addEventListener('resize', schedulePanelTopUpdate);
    window.addEventListener('scroll', schedulePanelTopUpdate, {
      passive: true,
    });
    return () => {
      document.removeEventListener('keydown', keydown);
      window.removeEventListener('aquarela:overlay-change', overlayChange);
      mql?.removeEventListener('change', handleDesktopCrossover);
      window.removeEventListener('resize', schedulePanelTopUpdate);
      window.removeEventListener('scroll', schedulePanelTopUpdate);
      if (panelTopFrame) cancelAnimationFrame(panelTopFrame);
    };
  });

  onDestroy(() => {
    if (open) {
      open = false;
      releaseOverlay();
    }
  });
</script>

<button
  class="menu-button"
  type="button"
  bind:this={trigger}
  aria-label="Abrir menu"
  aria-expanded={open}
  aria-controls="mobile-menu"
  on:click={show}><span aria-hidden="true">☰</span></button
>
{#if open}
  <div class="backdrop" role="presentation" on:click={() => close()}></div>
  <aside
    id="mobile-menu"
    class="menu-panel"
    style={`top: ${panelTop}px`}
    bind:this={panel}
    role="dialog"
    aria-modal="true"
    aria-label="Menu principal"
    on:click|stopPropagation
  >
    <button class="close" on:click={() => close()}>Fechar menu</button>
    <nav aria-label="Navegação principal">
      <a href="/" on:click={() => close(false, true)}>Início</a>
      {#each items as item (item.href)}
        <a href={item.href} on:click={() => close(false, true)}>{item.label}</a>
      {/each}
      <a class="cta" href="/visite" on:click={() => close(false, true)}
        >Quero conhecer</a
      >
    </nav>
  </aside>
{/if}

<style>
  .menu-button {
    display: none;
    width: 44px;
    height: 44px;
    border: 1px solid var(--border-control);
    border-radius: var(--radius-control);
    background: white;
    color: var(--text-ink);
    font-size: 1.25rem;
  }
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.4);
    z-index: var(--z-menu);
  }
  .menu-panel {
    position: fixed;
    z-index: var(--z-menu);
    top: 80px;
    right: 0;
    bottom: 0;
    width: min(100%, 420px);
    overflow: auto;
    background: white;
    padding: var(--space-6);
    padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
  }
  .close {
    min-height: 44px;
    border: 0;
    background: none;
    text-decoration: underline;
    color: var(--brand-navy);
    font-size: 1rem;
  }
  .menu-panel nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }
  .menu-panel nav a {
    padding: var(--space-3);
    color: var(--text-ink);
    font-size: 1.125rem;
  }
  .menu-panel .cta {
    color: white;
    text-align: center;
    text-decoration: none;
    margin-top: var(--space-4);
  }
  @media (max-width: 1099px) {
    .menu-button {
      display: block;
    }
  }
  @media (min-width: 1100px) {
    .menu-panel,
    .backdrop {
      display: none;
    }
  }
</style>
