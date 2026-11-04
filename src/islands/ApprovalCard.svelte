<script lang="ts">
  import { onMount } from 'svelte';
  import type { ApprovalAchievement } from '../lib/approval-groups';
  let {
    displayName,
    achievements,
    portraitUrl = null,
    portraitAlt,
    class: className = '',
  }: {
    displayName: string;
    achievements: ApprovalAchievement[];
    portraitUrl?: string | null;
    portraitAlt?: string | undefined;
    class?: string;
  } = $props();

  const uid = $props.id();
  let card: HTMLElement;
  let panel: HTMLDivElement;
  let closeButton: HTMLButtonElement;
  let trigger: HTMLButtonElement;
  let pinned = false;
  let suppressed = false;
  let opening: ReturnType<typeof setTimeout>;
  let closing: ReturnType<typeof setTimeout>;
  const desktopHover = () =>
    matchMedia('(min-width: 1100px) and (hover: hover) and (pointer: fine)')
      .matches;
  const isOpen = () => panel?.matches(':popover-open');
  function position() {
    if (!desktopHover()) {
      panel.style.removeProperty('left');
      panel.style.removeProperty('top');
      panel.style.removeProperty('margin');
      return;
    }
    const rect = card.getBoundingClientRect();
    const width = Math.min(420, innerWidth - 32);
    panel.style.margin = '0';
    panel.style.left = `${Math.max(16, Math.min(rect.left + rect.width / 2 - width / 2, innerWidth - width - 16))}px`;
    panel.style.top = `${Math.max(16, Math.min(rect.top, innerHeight - panel.offsetHeight - 16))}px`;
  }
  function enter() {
    clearTimeout(closing);
    if (
      !desktopHover() ||
      suppressed ||
      document.querySelector('[role="dialog"]')
    )
      return;
    opening = setTimeout(() => {
      const current = document.querySelector('.approval-panel:popover-open');
      if (
        current === panel ||
        current?.getAttribute('data-pinned') === 'true' ||
        current?.contains(document.activeElement)
      )
        return;
      pinned = false;
      panel.showPopover();
      position();
    }, 180);
  }
  function leave() {
    clearTimeout(opening);
    if (!isOpen()) suppressed = false;
    clearTimeout(closing);
    closing = setTimeout(() => {
      if (
        !pinned &&
        !card.matches(':hover') &&
        !panel.matches(':hover') &&
        !panel.contains(document.activeElement) &&
        isOpen()
      )
        panel.hidePopover();
    }, 300);
  }
  function click(event: MouseEvent) {
    clearTimeout(opening);
    clearTimeout(closing);
    pinned = true;
    panel.dataset.pinned = 'true';
    if (isOpen()) event.preventDefault();
    requestAnimationFrame(() => {
      if (isOpen()) {
        position();
        closeButton.focus({ preventScroll: true });
      }
    });
  }
  function toggled(event: ToggleEvent) {
    if (event.newState === 'open') position();
    else {
      pinned = false;
      delete panel.dataset.pinned;
      suppressed = card.matches(':hover');
      clearTimeout(opening);
      clearTimeout(closing);
    }
  }
  onMount(() => {
    const dismiss = () => {
      clearTimeout(opening);
      if (isOpen()) panel.hidePopover();
    };
    const outsideFocus = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !card.contains(event.target) &&
        !panel.contains(event.target)
      )
        dismiss();
    };
    const reposition = () => {
      if (isOpen()) position();
    };
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', reposition);
    document.addEventListener('focusin', outsideFocus);
    return () => {
      clearTimeout(opening);
      clearTimeout(closing);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('scroll', reposition);
      document.removeEventListener('focusin', outsideFocus);
    };
  });

  const portraitSrcset = $derived(
    portraitUrl?.match(/^\/media\/approvals\/[a-z-]+-800\.webp$/)
      ? `${portraitUrl.replace('-800.webp', '-400.webp')} 400w, ${portraitUrl} 800w`
      : undefined,
  );
</script>

<article
  bind:this={card}
  class={`approval-card ${className}`}
  class:has-portrait={portraitUrl}
  onpointerenter={enter}
  onpointerleave={leave}
>
  <div class="card-front">
    {#if portraitUrl}
      <span class="card-avatar" aria-hidden="true">
        <img
          src={portraitUrl}
          srcset={portraitSrcset}
          sizes="120px"
          alt=""
          width="800"
          height="1000"
          loading="lazy"
          decoding="async"
        />
      </span>
    {/if}
    <div class="card-summary">
      <h3 class="card-title" id={`${uid}-name`}>{displayName}</h3>
      {#if achievements.length > 1}
        <span class="approval-count">{achievements.length} aprovações</span>
      {/if}
      <ul class="course-summary">
        {#each achievements as achievement (achievement.id)}
          <li>{achievement.course}</li>
        {/each}
      </ul>
      <button
        bind:this={trigger}
        class="details-control"
        popovertarget={`${uid}-panel`}
        aria-label={`Ver detalhes de ${displayName}`}
        onclick={click}
      >
        Ver detalhes <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          ><path
            d="m5 7.5 5 5 5-5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          /></svg
        >
      </button>
    </div>
  </div>
  <div
    bind:this={panel}
    class="approval-panel"
    id={`${uid}-panel`}
    popover="auto"
    data-lenis-prevent
    role="region"
    aria-labelledby={`${uid}-panel-name`}
    onbeforetoggle={(event) => {
      if (event.newState === 'closed') {
        suppressed = card.matches(':hover');
        if (panel.contains(document.activeElement))
          trigger.focus({ preventScroll: true });
      }
    }}
    ontoggle={toggled}
    onpointerenter={() => clearTimeout(closing)}
    onpointerleave={leave}
    onfocusout={leave}
  >
    <div class="panel-header">
      <h3 id={`${uid}-panel-name`}>{displayName}</h3>
      <button
        bind:this={closeButton}
        class="close-details"
        popovertarget={`${uid}-panel`}
        popovertargetaction="hide"
        >Fechar detalhes <span aria-hidden="true">×</span></button
      >
    </div>
    <div class="card-body">
      {#if portraitUrl}
        <div class="card-media">
          <img
            src={portraitUrl}
            srcset={portraitSrcset}
            sizes="320px"
            alt={portraitAlt || displayName}
            width="800"
            height="1000"
            loading="lazy"
            decoding="async"
          />
        </div>
      {/if}
      <ul
        class="achievement-list"
        aria-label={`Todas as aprovações de ${displayName}`}
      >
        {#each achievements as achievement (achievement.id)}
          <li class="achievement">
            <p class="card-course">{achievement.course}</p>
            <p class="card-institution">{achievement.institution}</p>
            <dl class="card-facts">
              <div>
                <dt>Processo</dt>
                <dd>{achievement.selectionProcess}</dd>
              </div>
              <div>
                <dt>Ano</dt>
                <dd>{achievement.year}</dd>
              </div>
            </dl>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</article>

<style>
  .approval-card {
    min-width: 0;
    position: relative;
    height: 100%;
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
  }
  .card-front {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-4);
    color: var(--brand-navy);
    min-height: 48px;
  }
  .has-portrait > .card-front {
    grid-template-columns: 80px minmax(0, 1fr);
  }
  .approval-card:hover {
    background: var(--surface-paper);
  }
  .approval-card:focus-within {
    outline: 3px solid var(--brand-navy);
    outline-offset: -4px;
  }
  .card-avatar {
    position: relative;
    width: 80px;
    aspect-ratio: 1;
    background: var(--surface-paper);
    border: 1px solid var(--border-subtle);
    border-radius: 50%;
    overflow: hidden;
  }
  .card-avatar img {
    position: absolute;
    inset: 6px auto auto -25%;
    width: 150%;
    max-width: none;
    height: auto;
    aspect-ratio: 4 / 5;
  }
  .card-summary {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  .card-title {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }
  .approval-count {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-pill);
    background: var(--brand-yellow);
    font-size: 0.875rem;
  }
  .course-summary {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.875rem;
  }
  .course-summary li + li {
    margin-top: var(--space-1);
  }
  .details-control {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }
  .details-control,
  .close-details {
    min-height: 44px;
    text-decoration: underline;
    border: 0;
    background: none;
    color: var(--brand-navy);
    font: inherit;
    cursor: pointer;
  }
  .details-control::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-card);
  }
  .details-control:focus-visible {
    outline: none;
  }
  .close-details {
    padding: 8px;
    flex: none;
  }
  .close-details:focus-visible {
    outline: 3px solid var(--brand-navy);
    outline-offset: 2px;
  }
  .approval-panel {
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(420px, calc(100vw - 32px));
    max-height: calc(100dvh - 32px);
    height: fit-content;
    padding: 0;
    overflow: auto;
    overscroll-behavior: contain;
    background: var(--surface-base);
    color: var(--text-ink);
    border: 1px solid var(--brand-navy);
    border-radius: var(--radius-card);
    box-shadow: 0 20px 64px rgb(0 40 60 / 28%);
  }
  .panel-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--surface-base);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: var(--space-4);
  }
  .panel-header h3 {
    margin: 0;
    font-size: 1.25rem;
    overflow-wrap: anywhere;
  }
  .approval-panel:popover-open {
    animation: approval-arrive 200ms cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  @keyframes approval-arrive {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.94);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @media (min-width: 1100px) and (hover: hover) and (pointer: fine) {
    .approval-card:hover {
      box-shadow: var(--shadow);
      border-color: var(--brand-navy);
    }
    @media (prefers-reduced-motion: no-preference) {
      .approval-card {
        transition:
          transform 200ms cubic-bezier(0.2, 0.7, 0.2, 1),
          box-shadow 200ms ease-out,
          border-color 200ms ease-out;
      }
      .approval-card:hover {
        transform: scale(1.02);
      }
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .approval-panel:popover-open {
      animation: none;
    }
  }
  .card-body {
    padding: var(--space-4);
    border-top: 1px solid var(--border-subtle);
  }
  .card-media {
    display: flex;
    justify-content: center;
    background: var(--surface-paper);
    border-radius: var(--radius-card);
    overflow: hidden;
    margin-bottom: var(--space-4);
  }
  .card-media img {
    display: block;
    width: min(100%, 320px, 48svh);
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: contain;
  }
  .achievement-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .achievement {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .achievement + .achievement {
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-4);
  }
  .card-course {
    margin: 0;
    color: var(--brand-navy);
    font-weight: 500;
  }
  .card-institution {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }
  .card-facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin: 0;
  }
  .card-facts div {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  dt {
    color: var(--text-muted);
    font-size: 0.875rem;
  }
  dd {
    margin: 0;
    font-size: 0.875rem;
  }
  .course-summary,
  .card-course,
  .card-institution,
  dd {
    overflow-wrap: anywhere;
  }
</style>
