<script lang="ts">
  import { onMount } from 'svelte';

  type FontPresetId = 'neo' | 'outfit' | 'syne' | 'unbounded';

  interface FontOption {
    id: FontPresetId;
    name: string;
    tag: string;
    sample: string;
    fontCss: string;
  }

  const options: FontOption[] = [
    {
      id: 'neo',
      name: 'Plus Jakarta Sans',
      tag: 'Neo-editorial · EPSA',
      sample: 'Aquarela',
      fontCss: "'Plus Jakarta Sans', sans-serif",
    },
    {
      id: 'outfit',
      name: 'Outfit',
      tag: 'Original · ExtraBold',
      sample: 'Aquarela',
      fontCss: "'Outfit', sans-serif",
    },
    {
      id: 'syne',
      name: 'Syne',
      tag: 'Larga estilizada',
      sample: 'Aquarela',
      fontCss: "'Syne', sans-serif",
    },
    {
      id: 'unbounded',
      name: 'Unbounded',
      tag: 'Display ultra-larga',
      sample: 'Aquarela',
      fontCss: "'Unbounded', sans-serif",
    },
  ];

  let active = $state<FontPresetId>('neo');
  let expanded = $state(false);
  let containerEl: HTMLDivElement | null = $state(null);

  const isValid = (value: string | null): value is FontPresetId =>
    value === 'neo' ||
    value === 'outfit' ||
    value === 'syne' ||
    value === 'unbounded';

  const applyPreset = (id: FontPresetId) => {
    active = id;
    if (id === 'neo') {
      document.documentElement.removeAttribute('data-font-preset');
    } else {
      document.documentElement.setAttribute('data-font-preset', id);
    }
    try {
      window.localStorage.setItem('aquarela-font-preset', id);
    } catch {
      // Ignore storage access errors
    }
  };

  const activeOption = $derived(
    options.find((opt) => opt.id === active) ?? options[0]!,
  );

  onMount(() => {
    const attr = document.documentElement.getAttribute('data-font-preset');
    if (isValid(attr)) {
      active = attr;
    } else {
      try {
        const stored = window.localStorage.getItem('aquarela-font-preset');
        if (isValid(stored)) applyPreset(stored);
      } catch {
        // Default remains neo
      }
    }

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
  class="font-lab"
  aria-label="Comparador de tipografia (preview)"
  bind:this={containerEl}
>
  {#if expanded}
    <div
      class="font-lab-panel"
      role="region"
      aria-label="Escolher estilo de fonte"
    >
      <div class="font-lab-head">
        <span>Tipografia · Branch Preview</span>
        <button
          type="button"
          class="font-lab-close focus-on-navy"
          aria-label="Fechar seletor de fontes"
          onclick={() => (expanded = false)}
        >
          ✕
        </button>
      </div>
      <div class="font-lab-list">
        {#each options as option (option.id)}
          <button
            type="button"
            class="font-lab-option focus-on-navy"
            class:is-active={active === option.id}
            aria-pressed={active === option.id}
            onclick={() => applyPreset(option.id)}
          >
            <span class="option-sample" style={`font-family: ${option.fontCss}`}
              >{option.sample}</span
            >
            <span class="option-meta">
              <strong>{option.name}</strong>
              <small>{option.tag}</small>
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <button
    type="button"
    class="font-lab-toggle focus-on-navy"
    aria-expanded={expanded}
    aria-label={`Trocar fonte de teste (atual: ${activeOption.name})`}
    onclick={() => (expanded = !expanded)}
  >
    <span class="toggle-glyph" aria-hidden="true">Aa</span>
    <span class="toggle-name">{activeOption.name}</span>
  </button>
</aside>

<style>
  .font-lab {
    position: fixed;
    right: max(14px, env(safe-area-inset-right, 0px));
    bottom: max(14px, env(safe-area-inset-bottom, 0px));
    z-index: var(--z-switcher);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .font-lab-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 8px 16px 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: var(--radius-pill);
    background: rgba(12, 27, 38, 0.92);
    backdrop-filter: blur(14px);
    color: #ffffff;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.45);
  }

  .toggle-glyph {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--action-primary);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 800;
  }

  .font-lab-panel {
    width: min(300px, calc(100vw - 28px));
    padding: 14px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(12, 27, 38, 0.96);
    backdrop-filter: blur(18px);
    color: #ffffff;
    box-shadow: 0 24px 60px -18px rgba(0, 0, 0, 0.55);
  }

  .font-lab-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
  }

  .font-lab-close {
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .font-lab-list {
    display: grid;
    gap: 8px;
  }

  .font-lab-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    text-align: left;
    cursor: pointer;
  }

  .font-lab-option.is-active {
    border-color: var(--brand-yellow);
    background: rgba(255, 255, 255, 0.14);
  }

  .option-sample {
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
  }

  .option-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    min-width: 0;
  }

  .option-meta strong {
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .option-meta small {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.72);
  }

  @media (hover: hover) {
    .font-lab-toggle:hover {
      background: var(--brand-navy-deep);
    }
    .font-lab-option:hover {
      background: rgba(255, 255, 255, 0.12);
    }
  }
</style>
