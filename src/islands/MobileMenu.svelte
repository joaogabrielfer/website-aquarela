<script lang="ts">
  import { onMount } from 'svelte';
  export let items: readonly { label: string; href: string }[] = [];
  let open = false;
  let trigger: HTMLButtonElement;
  let panel: HTMLElement;
  let mql: MediaQueryList | undefined;

  const close = (restore = true, navigate = false) => {
    open = false;
    document.body.style.overflow = '';
    if (restore && !navigate) setTimeout(() => trigger?.focus(), 0);
  };

  const handleDesktopCrossover = () => {
    if (open) {
      const focusInPanel = panel?.contains(document.activeElement);
      close(false, true);
      if (focusInPanel) {
        const activeLink = document.querySelector(
          '.desktop-nav a.active',
        ) as HTMLElement | null;
        activeLink?.focus();
      }
    }
  };

  const keydown = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const els = [...panel.querySelectorAll<HTMLElement>('a,button')].filter(
        (e) => !e.hasAttribute('disabled'),
      );
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
    open = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => panel?.querySelector('button')?.focus(), 0);
  };

  onMount(() => {
    document.addEventListener('keydown', keydown);
    mql = window.matchMedia('(min-width: 1100px)');
    mql.addEventListener('change', handleDesktopCrossover);
    return () => {
      document.removeEventListener('keydown', keydown);
      mql?.removeEventListener('change', handleDesktopCrossover);
    };
  });
</script>

<button
  class="menu-button"
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
    bind:this={panel}
    role="dialog"
    aria-modal="true"
    aria-label="Menu principal"
    on:click|stopPropagation
  >
    <button class="close" on:click={() => close()}>Fechar menu</button>
    <nav aria-label="Navegação principal">
      <a href="/" on:click={() => close(false, true)}>Início</a>
      {#each items as item}
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
