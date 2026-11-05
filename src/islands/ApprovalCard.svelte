<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
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
  let panel: HTMLDialogElement;
  let trigger: HTMLButtonElement;
  let closing = $state(false);
  let restoreScroll: (() => void) | undefined;
  let backdropStart: { x: number; y: number; id: number } | undefined;
  let backdropTap = false;
  const outside = (x: number, y: number) => {
    const box = panel.getBoundingClientRect();
    return x < box.left || x > box.right || y < box.top || y > box.bottom;
  };
  function release() {
    restoreScroll?.();
    restoreScroll = undefined;
  }
  function open(event: MouseEvent) {
    event.preventDefault();
    if (panel.open || document.querySelector('dialog[open], [role="dialog"]'))
      return;
    const y = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const saved = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      rootOverflow: root.style.overflow,
    };
    const scrollbar = innerWidth - root.clientWidth;
    window.dispatchEvent(
      new CustomEvent('aquarela:overlay-change', {
        detail: { type: 'approval', open: true },
      }),
    );
    root.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbar)
      body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    restoreScroll = () => {
      body.style.position = saved.position;
      body.style.top = saved.top;
      body.style.width = saved.width;
      body.style.overflow = saved.overflow;
      body.style.paddingRight = saved.paddingRight;
      root.style.overflow = saved.rootOverflow;
      window.scrollTo({ top: y, behavior: 'instant' });
      window.dispatchEvent(
        new CustomEvent('aquarela:overlay-change', {
          detail: { type: 'approval', open: false },
        }),
      );
    };
    closing = false;
    panel.scrollTop = 0;
    panel.showModal();
  }
  async function close(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!panel.open || closing) return;
    closing = true;
    await tick();
    await Promise.allSettled(
      panel.getAnimations().map((animation) => animation.finished),
    );
    panel.close();
    release();
    closing = false;
    trigger.focus({ preventScroll: true });
  }
  onMount(() => {
    let touchY = 0;
    const start = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0]!;
      const delta = touchY - touch.clientY;
      touchY = touch.clientY;
      if (
        outside(touch.clientX, touch.clientY) ||
        panel.scrollHeight <= panel.clientHeight ||
        (delta < 0 && panel.scrollTop <= 0) ||
        (delta > 0 &&
          panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1)
      )
        event.preventDefault();
    };
    const wheel = (event: WheelEvent) => {
      if (
        outside(event.clientX, event.clientY) ||
        panel.scrollHeight <= panel.clientHeight ||
        (event.deltaY < 0 && panel.scrollTop <= 0) ||
        (event.deltaY > 0 &&
          panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1)
      )
        event.preventDefault();
    };
    panel.addEventListener('touchstart', start, { passive: true });
    panel.addEventListener('touchmove', move, { passive: false });
    panel.addEventListener('wheel', wheel, { passive: false });
    return () => {
      panel.removeEventListener('touchstart', start);
      panel.removeEventListener('touchmove', move);
      panel.removeEventListener('wheel', wheel);
    };
  });
  onDestroy(release);

  const portraitSrcset = $derived(
    portraitUrl?.match(/^\/media\/approvals\/[a-z-]+-800\.webp$/)
      ? `${portraitUrl.replace('-800.webp', '-400.webp')} 400w, ${portraitUrl} 800w`
      : undefined,
  );
</script>

<article class={`approval-card ${className}`} class:has-portrait={portraitUrl}>
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
        commandfor={`${uid}-panel`}
        command="show-modal"
        aria-label={`Ver detalhes de ${displayName}`}
        onclick={open}
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
  <dialog
    bind:this={panel}
    class="approval-panel"
    class:is-closing={closing}
    id={`${uid}-panel`}
    data-lenis-prevent
    aria-labelledby={`${uid}-panel-name`}
    oncancel={close}
    onclose={() => {
      if (!panel.open) release();
    }}
    onpointerdown={(event) => {
      backdropTap = false;
      backdropStart = outside(event.clientX, event.clientY)
        ? { x: event.clientX, y: event.clientY, id: event.pointerId }
        : undefined;
    }}
    onpointermove={(event) => {
      if (
        backdropStart &&
        Math.hypot(
          event.clientX - backdropStart.x,
          event.clientY - backdropStart.y,
        ) > 8
      )
        backdropStart = undefined;
    }}
    onpointerup={(event) => {
      backdropTap =
        !!backdropStart &&
        event.pointerId === backdropStart.id &&
        outside(event.clientX, event.clientY);
      backdropStart = undefined;
    }}
    onpointercancel={() => {
      backdropStart = undefined;
      backdropTap = false;
    }}
    onclick={(event) => {
      if (
        event.target === panel &&
        backdropTap &&
        outside(event.clientX, event.clientY)
      )
        void close(event);
      backdropTap = false;
    }}
  >
    <div class="panel-header">
      <h3 id={`${uid}-panel-name`}>{displayName}</h3>
      <button
        class="close-details"
        commandfor={`${uid}-panel`}
        command="close"
        onclick={close}
        autofocus>Fechar detalhes <span aria-hidden="true">×</span></button
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
  </dialog>
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
    width: min(420px, calc(100vw - 40px));
    max-height: calc(100dvh - 48px);
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
  .approval-panel[open] {
    animation: approval-arrive 150ms cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .approval-panel.is-closing {
    animation: approval-depart 110ms ease-in forwards;
  }
  .approval-panel::backdrop {
    background: rgb(0 30 50 / 34%);
    animation: backdrop-arrive 150ms ease-out;
  }
  .approval-panel.is-closing::backdrop {
    animation: backdrop-depart 110ms ease-in forwards;
  }
  :global(html:has(.approval-panel[open])) {
    overflow: hidden;
  }
  @keyframes approval-depart {
    to {
      opacity: 0;
      transform: translateY(6px) scale(0.98);
    }
  }
  @keyframes backdrop-arrive {
    from {
      background: rgb(0 30 50 / 0%);
    }
  }
  @keyframes backdrop-depart {
    to {
      background: rgb(0 30 50 / 0%);
    }
  }
  @keyframes approval-arrive {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.97);
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
    .approval-panel[open],
    .approval-panel.is-closing,
    .approval-panel::backdrop,
    .approval-panel.is-closing::backdrop {
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
    width: min(100%, 260px, 32svh);
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: contain;
  }
  @media (min-width: 1100px) {
    .approval-panel {
      width: min(760px, calc(100vw - 64px));
      height: min(560px, calc(100dvh - 64px));
      max-height: calc(100dvh - 64px);
    }
    .card-body {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      gap: var(--space-5);
      align-items: start;
    }
    .card-media img {
      width: min(100%, 320px);
    }
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
