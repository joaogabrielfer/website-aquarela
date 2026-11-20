<script lang="ts">
  import { onMount } from 'svelte';

  interface AnchorItem {
    slug: string;
    num: string;
    label: string;
  }

  interface Props {
    anchors: AnchorItem[];
  }

  let { anchors }: Props = $props();
  let activeIdx = $state(0);
  let lockedUntil = 0;

  const activate = (idx: number, slug: string, event: MouseEvent) => {
    event.preventDefault();
    activeIdx = idx;
    lockedUntil = performance.now() + 750;

    const target = document.getElementById(slug);
    if (!target) return;

    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'reduced';

    if (window.location.hash !== `#${slug}`) {
      history.replaceState(null, '', `#${slug}`);
    }

    target.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  onMount(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      const idx = anchors.findIndex((a) => a.slug === hash);
      if (idx >= 0) activeIdx = idx;
    };

    syncFromHash();

    let raf = 0;
    const syncFromScroll = () => {
      raf = 0;
      if (performance.now() < lockedUntil) return;

      const header = document.querySelector<HTMLElement>('#site-header');
      const offset = (header?.offsetHeight ?? 68) + 110;
      let current = 0;

      for (let i = 0; i < anchors.length; i++) {
        const el = document.getElementById(anchors[i]!.slug);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = i;
        }
      }

      if (current !== activeIdx) activeIdx = current;
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(syncFromScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', syncFromHash);
    syncFromScroll();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', syncFromHash);
    };
  });
</script>

<nav class="segment-anchor-nav" aria-label="Etapas de ensino">
  <div class="container segment-anchor-nav__inner">
    <div class="pill-track">
      {#each anchors as item, idx (item.slug)}
        {@const isActive = activeIdx === idx}
        <a
          href={`/ensino#${item.slug}`}
          class="stage-pill"
          class:is-active={isActive}
          aria-current={isActive ? 'location' : undefined}
          aria-label={`${item.num} — ${item.label}`}
          title={item.label}
          onclick={(e) => activate(idx, item.slug, e)}
        >
          <span class="pill-num" aria-hidden="true">{item.num}</span>
          <span class="pill-label" aria-hidden="true">{item.label}</span>
        </a>
      {/each}
    </div>
  </div>
</nav>

<style>
  .segment-anchor-nav {
    position: sticky;
    top: var(--site-header-height);
    z-index: var(--z-sticky);
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid var(--border-subtle);
    padding: 8px 0;
  }

  .segment-anchor-nav__inner {
    display: flex;
    align-items: center;
  }

  .pill-track {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;
    width: 100%;
    max-width: 540px;
  }

  .stage-pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 40px;
    height: 40px;
    min-width: 40px;
    padding: 0;
    border-radius: var(--radius-pill);
    background: var(--surface-soft);
    border: 1px solid var(--border-subtle);
    color: var(--brand-navy);
    text-decoration: none;
    overflow: hidden;
    transition:
      flex-grow 380ms cubic-bezier(0.22, 1, 0.36, 1),
      flex-basis 380ms cubic-bezier(0.22, 1, 0.36, 1),
      padding 340ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 240ms var(--ease),
      border-color 240ms var(--ease),
      color 240ms var(--ease);
  }

  .stage-pill.is-active {
    flex: 1 1 auto;
    min-width: 0;
    justify-content: flex-start;
    gap: 8px;
    padding: 0 14px 0 8px;
    background: var(--brand-navy);
    border-color: var(--brand-navy);
    color: #ffffff;
    box-shadow: 0 8px 20px -12px rgba(14, 34, 48, 0.55);
  }

  .pill-num {
    display: inline-grid;
    place-items: center;
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1;
    color: var(--brand-navy);
    transition:
      background-color 240ms var(--ease),
      color 240ms var(--ease);
  }

  .stage-pill.is-active .pill-num {
    background: rgba(255, 255, 255, 0.14);
    color: var(--brand-yellow);
  }

  .pill-label {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 0;
    opacity: 0;
    transition:
      max-width 360ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms var(--ease);
  }

  .stage-pill.is-active .pill-label {
    max-width: 260px;
    opacity: 1;
  }

  @media (hover: hover) {
    .stage-pill:not(.is-active):hover {
      background: #e6eef4;
      border-color: rgba(14, 34, 48, 0.25);
    }
  }

  .stage-pill:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
  }

  @media (min-width: 640px) {
    .pill-track {
      gap: 8px;
    }
    .stage-pill {
      flex: 0 0 42px;
      height: 42px;
      min-width: 42px;
    }
    .stage-pill.is-active {
      padding: 0 18px 0 9px;
    }
    .pill-label {
      font-size: 0.84rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage-pill,
    .pill-num,
    .pill-label {
      transition: none;
    }
  }

  :global(html[data-motion='reduced']) .stage-pill,
  :global(html[data-motion='reduced']) .pill-num,
  :global(html[data-motion='reduced']) .pill-label {
    transition: none;
  }
</style>
