<!--
  LoadMore (C07) — paginação local genérica.

  Recebe uma lista completa de itens já projetados (sem review).
  Renderiza um lote inicial no servidor (via Svelte SSR) e anexa novos lotes
  ao clicar "Carregar mais". Foco e announce conforme contrato.
-->
<script lang="ts">
  let {
    items = [],
    initialCount = 9,
    batchSize = 9,
    buttonLabel = 'Carregar mais',
  }: {
    items: unknown[];
    initialCount?: number;
    batchSize?: number;
    buttonLabel?: string;
  } = $props();

  let visibleCount = $state(Math.max(0, initialCount));
  let hasLoadedMore = $state(false);
  let buttonEl: HTMLButtonElement | null = $state(null);
  let statusEl: HTMLDivElement | null = $state(null);
  let announcement = $state('');

  const visibleItems = $derived(items.slice(0, visibleCount));
  const remaining = $derived(items.length - visibleCount);
  const hasMore = $derived(remaining > 0);

  const loadMore = () => {
    const prevCount = visibleCount;
    const increment = Math.max(1, batchSize);
    visibleCount = Math.min(visibleCount + increment, items.length);
    const added = visibleCount - prevCount;

    if (added <= 0) return;

    hasLoadedMore = true;
    announcement =
      added === 1 ? '1 item adicionado' : `${added} itens adicionados`;

    // If no more items, move focus to status
    if (visibleCount >= items.length) {
      requestAnimationFrame(() => {
        statusEl?.focus();
      });
    } else {
      // Keep focus on button
      requestAnimationFrame(() => {
        buttonEl?.focus();
      });
    }
  };
</script>

<div class="load-more-wrapper">
  <slot items={visibleItems} />
</div>

<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {announcement}
</div>

{#if hasMore}
  <button
    class="load-more-btn btn focus-on-navy"
    type="button"
    on:click={loadMore}
    bind:this={buttonEl}
  >
    {buttonLabel}
  </button>
{:else if hasLoadedMore}
  <div
    class="load-more-status"
    role="status"
    tabindex="-1"
    bind:this={statusEl}
  >
    Todos os itens foram exibidos
  </div>
{/if}

<style>
  .load-more-wrapper {
    /* Wrapper for the slotted content */
  }
  .load-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 12px 24px;
    border-radius: var(--radius-pill);
    background: var(--surface-base);
    color: var(--brand-navy);
    border: 1px solid var(--brand-navy);
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    margin-top: var(--space-8);
  }
  @media (hover: hover) {
    .load-more-btn:hover {
      background: var(--surface-paper);
    }
  }
  .load-more-btn:active {
    background: var(--surface-disabled);
  }
  .load-more-btn:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px white;
  }
  .load-more-status {
    margin-top: var(--space-8);
    color: var(--text-muted);
    font-size: 0.875rem;
    text-align: center;
    padding: var(--space-4);
    min-height: 44px;
  }
  .load-more-status:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px white;
    border-radius: var(--radius-control);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
