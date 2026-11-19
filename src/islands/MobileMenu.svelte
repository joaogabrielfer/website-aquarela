<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';

  export let items: ReadonlyArray<{ label: string; href: string }> = [];
  export let current = '/';
  export let phoneLabel: string | null = null;
  export let phoneHref: string | null = null;
  export let whatsappHref: string | null = null;
  export let addressText: string | null = null;
  export let officeHours: string | null = null;
  export let instagramUrl: string | null = null;

  let open = false;
  let trigger: HTMLButtonElement;
  let closeBtn: HTMLButtonElement;
  let panel: HTMLDivElement;
  let lightboxOpen = false;
  let inertElements: Array<{
    element: HTMLElement;
    inert: boolean;
    attribute: boolean;
  }> = [];

  const isActive = (href: string) =>
    href === '/galeria' ? current.startsWith('/galeria') : current === href;

  const currentLabel = (() => {
    if (current === '/') return 'Início';
    if (current === '/visite') return 'Visite';
    if (current === '/privacidade') return 'Privacidade';
    const match = items.find((item) => isActive(item.href));
    return match?.label ?? 'Aquarela';
  })();

  const menuEntries = [{ label: 'Início', href: '/' }, ...items];

  const getMain = () => document.querySelector<HTMLElement>('#main-content');
  const getFooter = () => document.querySelector<HTMLElement>('.site-footer');

  const setBackgroundInert = (value: boolean) => {
    if (value) {
      const candidates = [getMain(), getFooter()].filter(
        (el): el is HTMLElement => el !== null,
      );
      inertElements = candidates.map((element) => {
        const prev = Boolean(
          (element as HTMLElement & { inert?: boolean }).inert,
        );
        const attr = element.hasAttribute('inert');
        element.setAttribute('inert', '');
        (element as HTMLElement & { inert?: boolean }).inert = true;
        return { element, inert: prev, attribute: attr };
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

  let scrollY = 0;
  let locked = false;

  const lockScroll = () => {
    if (locked) return;
    locked = true;
    scrollY = window.scrollY;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  };

  const unlockScroll = (skipScrollRestore = false) => {
    if (!locked) return;
    locked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (!skipScrollRestore) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
  };

  const emitOverlay = (isOpen: boolean) => {
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'menu', open: isOpen },
      }),
    );
  };

  async function openMenu() {
    if (open || lightboxOpen || document.querySelector('.lightbox-dialog')) {
      return;
    }
    open = true;
    lockScroll();
    setBackgroundInert(true);
    emitOverlay(true);
    await tick();
    closeBtn?.focus({ preventScroll: true });
  }

  function close(restoreFocus = true, navigating = false) {
    if (!open) return;
    open = false;
    setBackgroundInert(false);
    unlockScroll(navigating);
    emitOverlay(false);
    if (restoreFocus && !navigating) {
      requestAnimationFrame(() => {
        trigger?.focus({ preventScroll: true });
      });
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key === 'Tab' && panel) {
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  onMount(() => {
    const onOverlay = ((
      event: CustomEvent<{ type: string; open: boolean }>,
    ) => {
      if (event.detail?.type === 'lightbox') {
        lightboxOpen = event.detail.open;
      }
    }) as EventListener;
    window.addEventListener('aquarela:overlay-change', onOverlay);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('aquarela:overlay-change', onOverlay);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  onDestroy(() => {
    if (open) close(false, true);
  });
</script>

<button
  bind:this={trigger}
  type="button"
  class="menu-toggle"
  aria-label={open ? 'Fechar menu' : 'Abrir menu'}
  aria-expanded={open}
  aria-controls="mobile-menu"
  onclick={() => (open ? close(true) : openMenu())}
>
  <span class="menu-toggle-label">Menu</span>
  <span class="menu-toggle-lines" class:is-open={open} aria-hidden="true">
    <i></i>
    <i></i>
  </span>
</button>

{#if open}
  <div class="backdrop" role="presentation" onclick={() => close(true)}></div>
  <div
    bind:this={panel}
    id="mobile-menu"
    class="menu-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Menu principal"
    data-lenis-prevent
  >
    <div class="container menu-shell">
      <div class="menu-header">
        <p class="menu-location">
          Você está em <strong>{currentLabel}</strong>
        </p>
        <button
          bind:this={closeBtn}
          type="button"
          class="close focus-on-navy"
          aria-label="Fechar menu"
          onclick={() => close(true)}
        >
          <span>Fechar</span>
          <span class="close-x" aria-hidden="true">✕</span>
        </button>
      </div>

      <div class="menu-grid">
        <nav class="menu-nav" aria-label="Navegação do menu">
          {#each menuEntries as entry, idx (entry.href)}
            <a
              href={entry.href}
              class="menu-item focus-on-navy"
              class:active={isActive(entry.href)}
              aria-current={isActive(entry.href) ? 'page' : undefined}
              onclick={() => close(false, true)}
            >
              <span class="menu-num" aria-hidden="true"
                >{String(idx + 1).padStart(2, '0')}</span
              >
              <span class="menu-name">{entry.label}</span>
              {#if isActive(entry.href)}
                <span class="menu-here">Você está aqui</span>
              {:else}
                <span class="menu-arrow" aria-hidden="true">↗</span>
              {/if}
            </a>
          {/each}
        </nav>

        <div class="menu-aside">
          <div class="menu-photo-card">
            <img
              src="/media/hero-colegio-1200.webp"
              srcset="/media/hero-colegio-480.webp 480w, /media/hero-colegio-768.webp 768w, /media/hero-colegio-1200.webp 1200w"
              sizes="(min-width: 1100px) 42vw, 100vw"
              alt="Vista aérea do Aquarela Colégio e Curso em Paulista/PE"
              width="1200"
              height="675"
              loading="lazy"
            />
            <div class="menu-photo-caption">
              <span>Paulista · PE</span>
              <strong>Aquarela Colégio e Curso</strong>
            </div>
          </div>

          <div class="menu-meta">
            {#if addressText}
              <p class="menu-info">{addressText}</p>
            {/if}
            {#if officeHours}
              <p class="menu-info menu-hours">{officeHours}</p>
            {/if}
            <div class="menu-quick-links">
              {#if whatsappHref}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener"
                  class="menu-quick focus-on-navy"
                  onclick={() => close(false, true)}
                >
                  WhatsApp <span aria-hidden="true">↗</span>
                </a>
              {/if}
              {#if phoneHref && phoneLabel}
                <a
                  href={phoneHref}
                  class="menu-quick focus-on-navy"
                  onclick={() => close(false, true)}
                >
                  {phoneLabel}
                </a>
              {/if}
              {#if instagramUrl}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener"
                  class="menu-quick focus-on-navy"
                  onclick={() => close(false, true)}
                >
                  Instagram <span aria-hidden="true">↗</span>
                </a>
              {/if}
            </div>
          </div>

          <a
            class="cta focus-on-navy"
            href="/visite"
            aria-current={isActive('/visite') ? 'page' : undefined}
            onclick={() => close(false, true)}
          >
            Quero conhecer <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 8px 14px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-pill);
    background: var(--surface-soft);
    color: var(--text-ink);
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease),
      border-color var(--duration-fast) var(--ease);
  }

  @media (max-width: 439px) {
    .menu-toggle {
      padding: 8px 11px;
      gap: 0;
      min-width: 44px;
      justify-content: center;
    }
    .menu-toggle-label {
      display: none;
    }
  }

  @media (hover: hover) {
    .menu-toggle:hover {
      background: var(--surface-elevated);
      border-color: var(--brand-navy);
    }
  }

  .menu-toggle-lines {
    display: grid;
    gap: 5px;
    width: 20px;
  }

  .menu-toggle-lines i {
    display: block;
    height: 2px;
    width: 100%;
    border-radius: 2px;
    background: currentColor;
    transition: transform 320ms var(--ease-expo);
  }

  .menu-toggle-lines.is-open i:first-child {
    transform: translateY(3.5px) rotate(45deg);
  }

  .menu-toggle-lines.is-open i:last-child {
    transform: translateY(-3.5px) rotate(-45deg);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(8, 19, 28, 0.56);
    backdrop-filter: blur(6px);
    z-index: var(--z-menu);
    touch-action: none;
  }

  .menu-panel {
    position: fixed;
    z-index: var(--z-menu);
    top: var(--site-header-height);
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--surface-dark);
    color: #ffffff;
    padding: 20px 0 calc(28px + env(safe-area-inset-bottom, 0px));
    animation: editorial-menu-reveal 440ms var(--ease-expo) both;
  }

  @keyframes editorial-menu-reveal {
    from {
      opacity: 0;
      clip-path: inset(0 0 100% 0);
    }
    to {
      opacity: 1;
      clip-path: inset(0 0 0 0);
    }
  }

  .menu-shell {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-on-dark);
  }

  .menu-location {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-on-dark-muted);
  }

  .menu-location strong {
    color: #ffffff;
    font-weight: 700;
  }

  .close {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  @media (hover: hover) {
    .close:hover {
      background: rgba(255, 255, 255, 0.16);
    }
  }

  .menu-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .menu-nav {
    display: flex;
    flex-direction: column;
  }

  .menu-item {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 14px 12px;
    color: #ffffff;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition:
      background-color 220ms var(--ease),
      padding-left 280ms var(--ease);
  }

  .menu-num {
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.55);
    min-width: 24px;
  }

  .menu-name {
    font-family: var(--font-display);
    font-size: calc(clamp(1.45rem, 4.2vw, 2.35rem) * var(--display-scale));
    font-weight: var(--display-weight);
    line-height: 1.1;
    letter-spacing: var(--display-tracking);
    flex: 1;
  }

  .menu-arrow {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.65);
    transition: transform 280ms var(--ease);
  }

  .menu-here {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.14);
    color: #ffd3d7;
    white-space: nowrap;
  }

  .menu-item.active {
    background: rgba(255, 255, 255, 0.08);
  }

  .menu-item.active .menu-num {
    color: var(--brand-yellow);
  }

  @media (hover: hover) {
    .menu-item:hover {
      background: rgba(255, 255, 255, 0.09);
      padding-left: 20px;
    }
    .menu-item:hover .menu-arrow {
      color: #ffffff;
      transform: translate(3px, -3px);
    }
  }

  .menu-aside {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .menu-photo-card {
    display: none;
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    background: var(--surface-dark-elevated);
  }

  .menu-photo-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .menu-photo-caption {
    position: absolute;
    inset: auto 0 0 0;
    padding: 20px;
    background: linear-gradient(180deg, transparent, rgba(8, 19, 28, 0.88));
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-photo-caption span {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
  }

  .menu-photo-caption strong {
    font-family: var(--font-display);
    font-size: 1.125rem;
    color: #ffffff;
  }

  .menu-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu-info {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.86);
    line-height: 1.5;
  }

  .menu-hours {
    color: rgba(255, 255, 255, 0.7);
  }

  .menu-quick-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    margin-top: 6px;
  }

  .menu-quick {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    padding: 14px 24px;
    border-radius: 16px;
    background: var(--action-primary);
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    text-decoration: none;
    text-align: center;
  }

  @media (hover: hover) {
    .cta:hover {
      background: var(--action-hover);
      box-shadow: var(--shadow-action);
    }
  }

  @media (min-width: 960px) {
    .menu-panel {
      padding: 32px 0 40px;
    }
    .menu-grid {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.85fr);
      gap: 48px;
      align-items: start;
    }
    .menu-photo-card {
      display: block;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-panel {
      animation: none;
    }
  }
</style>
