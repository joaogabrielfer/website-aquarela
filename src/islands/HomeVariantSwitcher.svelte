<script lang="ts">
  import { onMount } from 'svelte';

  interface Variant {
    id: string;
    num: string;
    name: string;
    tag: string;
    href: string;
  }

  interface Props {
    currentPath?: string;
  }

  let { currentPath = '/' }: Props = $props();

  const variants: Variant[] = [
    {
      id: 'portal',
      num: '01',
      name: 'Portal EPSA',
      tag: 'Foto cheia + botões de acesso direto',
      href: '/home-portal',
    },
    {
      id: 'story',
      num: '02',
      name: 'Scrollytelling',
      tag: 'Estilo Cula: 4 atos não-lineares no scroll',
      href: '/home-story',
    },
    {
      id: 'bento',
      num: '03',
      name: 'Bento Editorial',
      tag: 'Mosaico interativo pensado pro polegar',
      href: '/home-bento',
    },
    {
      id: 'current',
      num: '04',
      name: 'Editorial Atual',
      tag: 'Hero + ticker (sem a barra inferior)',
      href: '/',
    },
  ];

  const normalizedPath = $derived(
    currentPath
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
      .replace(/\/$/, '') || '/',
  );

  const activeIdx = $derived(
    variants.findIndex((v) => v.href === normalizedPath),
  );

  const activeVariant = $derived(activeIdx >= 0 ? variants[activeIdx]! : null);

  const prevVariant = $derived(
    activeIdx >= 0
      ? variants[(activeIdx - 1 + variants.length) % variants.length]!
      : variants[0]!,
  );

  const nextVariant = $derived(
    activeIdx >= 0
      ? variants[(activeIdx + 1) % variants.length]!
      : variants[0]!,
  );

  let expanded = $state(false);
  let containerEl: HTMLElement | undefined = $state();

  onMount(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) expanded = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        expanded &&
        containerEl &&
        e.target instanceof Node &&
        !containerEl.contains(e.target)
      ) {
        expanded = false;
      }
    };

    document.addEventListener('keydown', onKeydown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  });
</script>

<aside
  class="variant-lab"
  aria-label="Comparador de iterações da Home (preview)"
  bind:this={containerEl}
>
  {#if expanded}
    <div
      class="variant-panel"
      role="region"
      aria-label="Escolher iteração da página inicial"
    >
      <div class="variant-head">
        <span>Iterações da Home · Preview</span>
        <button
          type="button"
          class="variant-close focus-on-navy"
          aria-label="Fechar seletor de iterações"
          onclick={() => (expanded = false)}
        >
          ✕
        </button>
      </div>

      <nav class="variant-list" aria-label="Versões da Home">
        {#each variants as item (item.id)}
          <a
            href={item.href}
            class="variant-option focus-on-navy"
            class:is-active={activeVariant?.id === item.id}
            aria-current={activeVariant?.id === item.id ? 'page' : undefined}
          >
            <span class="variant-num">{item.num}</span>
            <span class="variant-meta">
              <strong>{item.name}</strong>
              <small>{item.tag}</small>
            </span>
            <span class="variant-arrow" aria-hidden="true">↗</span>
          </a>
        {/each}
      </nav>

      <div class="variant-nav-row">
        <a href={prevVariant.href} class="variant-step focus-on-navy">
          ← {prevVariant.num}
          {prevVariant.name}
        </a>
        <a href={nextVariant.href} class="variant-step focus-on-navy">
          {nextVariant.num}
          {nextVariant.name} →
        </a>
      </div>
    </div>
  {/if}

  <button
    type="button"
    class="variant-toggle focus-on-navy"
    aria-expanded={expanded}
    aria-label={activeVariant
      ? `Trocar iteração da Home (atual: ${activeVariant.num} ${activeVariant.name})`
      : 'Comparar iterações da Home'}
    onclick={() => (expanded = !expanded)}
  >
    <span class="toggle-badge" aria-hidden="true">
      {activeVariant ? `${activeVariant.num}/04` : '4×'}
    </span>
    <span class="toggle-name">
      {activeVariant ? activeVariant.name : 'Testar Homes'}
    </span>
  </button>
</aside>

<style>
  .variant-lab {
    position: fixed;
    right: max(12px, env(safe-area-inset-right, 0px));
    bottom: max(12px, env(safe-area-inset-bottom, 0px));
    z-index: var(--z-switcher);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .variant-toggle {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 5px 14px 5px 6px;
    border-radius: var(--radius-pill);
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(12, 27, 38, 0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    color: #ffffff;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 14px 34px -14px rgba(0, 0, 0, 0.55);
    transition:
      transform var(--duration-fast) var(--ease),
      background-color var(--duration-fast) var(--ease);
  }

  .variant-toggle:hover {
    background: #0c1b26;
    transform: translateY(-1px);
  }

  .toggle-badge {
    min-width: 40px;
    height: 32px;
    padding: 0 8px;
    border-radius: var(--radius-pill);
    display: grid;
    place-items: center;
    background: var(--action-primary);
    color: #ffffff;
    font-family: var(--font-display);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .toggle-name {
    white-space: nowrap;
  }

  .variant-panel {
    width: min(332px, calc(100vw - 24px));
    padding: 14px;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(10, 23, 34, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: #ffffff;
    box-shadow: 0 28px 64px -16px rgba(0, 0, 0, 0.64);
  }

  .variant-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    padding-inline: 2px;
  }

  .variant-head span {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
  }

  .variant-close {
    width: 36px;
    height: 36px;
    min-height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    cursor: pointer;
    font-size: 0.85rem;
    display: grid;
    place-items: center;
  }

  .variant-list {
    display: grid;
    gap: 7px;
  }

  .variant-option {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 11px;
    min-height: 54px;
    padding: 9px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    text-decoration: none;
    transition:
      background-color var(--duration-fast) var(--ease),
      border-color var(--duration-fast) var(--ease);
  }

  .variant-option:hover {
    background: rgba(255, 255, 255, 0.11);
  }

  .variant-option.is-active {
    background: rgba(217, 20, 36, 0.18);
    border-color: var(--brand-yellow);
  }

  .variant-num {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--brand-yellow);
  }

  .variant-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .variant-meta strong {
    font-family: var(--font-display);
    font-size: 0.76rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
  }

  .variant-meta small {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.74);
    line-height: 1.3;
  }

  .variant-arrow {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.65);
  }

  .variant-nav-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .variant-step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 6px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .variant-step:hover {
    background: rgba(255, 255, 255, 0.16);
  }
</style>
