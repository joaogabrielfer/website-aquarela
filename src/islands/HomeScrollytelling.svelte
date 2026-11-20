<script lang="ts">
  import { onMount } from 'svelte';

  interface StageImage {
    src: string;
    srcset?: string | undefined;
    alt: string;
    width: number;
    height: number;
    objectPosition?: string | undefined;
  }

  interface StageSegment {
    num: string;
    slug: string;
    name: string;
    shifts: string[];
  }

  interface StageApproval {
    name: string;
    summary: string;
    portraitUrl: string | null;
    portraitAlt: string;
  }

  interface Props {
    heroTitle: string;
    heroSupport: string;
    tagline: string;
    whatsappHref: string | null;
    environmentsCount: number;
    environmentHighlights: string[];
    segments: StageSegment[];
    approvals: StageApproval[];
    images: {
      aerial: StageImage;
      classroom: StageImage;
      spaces: StageImage;
      students: StageImage;
    };
  }

  let {
    heroTitle,
    heroSupport,
    tagline,
    whatsappHref,
    environmentsCount,
    environmentHighlights,
    segments,
    approvals,
    images,
  }: Props = $props();

  let runwayEl: HTMLElement | undefined = $state();
  let progress = $state(0);
  let reduced = $state(false);

  const actCount = 4;

  const actLabels = [
    { num: '01', label: 'Aquarela', anchor: 0.0 },
    { num: '02', label: 'Ensino', anchor: 0.34 },
    { num: '03', label: 'Espaços', anchor: 0.66 },
    { num: '04', label: 'Futuro', anchor: 0.94 },
  ];

  // Smooth act weighting (0..1) with soft crossfade overlap
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const actWeights = $derived.by(() => {
    if (reduced) return [1, 1, 1, 1];
    const p = progress;
    const w0 = 1 - clamp01((p - 0.17) / 0.13);
    const w1 = clamp01((p - 0.19) / 0.12) * (1 - clamp01((p - 0.48) / 0.12));
    const w2 = clamp01((p - 0.5) / 0.12) * (1 - clamp01((p - 0.76) / 0.12));
    const w3 = clamp01((p - 0.78) / 0.12);
    return [w0, w1, w2, w3];
  });

  const activeAct = $derived.by(() => {
    if (progress < 0.24) return 0;
    if (progress < 0.54) return 1;
    if (progress < 0.82) return 2;
    return 3;
  });

  // Non-linear aperture opening on the initial frame (0 -> 0.16)
  const aperture = $derived(reduced ? 1 : clamp01(progress / 0.16));

  const jumpToAct = (idx: number) => {
    if (!runwayEl) return;
    const rect = runwayEl.getBoundingClientRect();
    const topDoc = window.scrollY + rect.top;
    const scrollable = Math.max(0, rect.height - window.innerHeight);
    const targetY = topDoc + scrollable * (actLabels[idx]?.anchor ?? 0);
    window.scrollTo({
      top: targetY,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReduced = () => {
      reduced =
        mq.matches || document.documentElement.dataset.motion === 'reduced';
    };
    syncReduced();

    let raf = 0;
    const measure = () => {
      raf = 0;
      if (!runwayEl || reduced) return;
      const rect = runwayEl.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      progress = clamp01(-rect.top / scrollable);
    };

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    mq.addEventListener('change', syncReduced);
    measure();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mq.removeEventListener('change', syncReduced);
    };
  });
</script>

<section
  class="story-runway"
  class:is-reduced={reduced}
  bind:this={runwayEl}
  aria-label="Jornada interativa pelo Aquarela Colégio e Curso"
>
  <div class="story-sticky">
    <div
      class="story-frame"
      style={`--aperture: ${aperture.toFixed(3)}; --p: ${progress.toFixed(4)};`}
    >
      <!-- Living background photographic layers (GPU crossfade + scale) -->
      <div class="story-bg-stack" aria-hidden="true">
        <div
          class="story-bg-layer"
          style={`opacity: ${reduced ? 1 : Math.max(0.15, actWeights[0] ?? 0).toFixed(3)}; transform: scale(${(1.02 + progress * 0.14).toFixed(4)});`}
        >
          <img
            class="hero-photo"
            src={images.aerial.src}
            srcset={images.aerial.srcset}
            sizes="100vw"
            alt={images.aerial.alt}
            width={images.aerial.width}
            height={images.aerial.height}
            style={images.aerial.objectPosition
              ? `object-position: ${images.aerial.objectPosition}`
              : undefined}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </div>

        <div
          class="story-bg-layer"
          style={`opacity: ${reduced ? 0 : (actWeights[1] ?? 0).toFixed(3)}; transform: scale(${(1.1 - Math.max(0, progress - 0.2) * 0.12).toFixed(4)});`}
        >
          <img
            src={images.classroom.src}
            srcset={images.classroom.srcset}
            sizes="100vw"
            alt={images.classroom.alt}
            width={images.classroom.width}
            height={images.classroom.height}
            style={images.classroom.objectPosition
              ? `object-position: ${images.classroom.objectPosition}`
              : undefined}
            loading="eager"
            decoding="async"
          />
        </div>

        <div
          class="story-bg-layer"
          style={`opacity: ${reduced ? 0 : (actWeights[2] ?? 0).toFixed(3)}; transform: scale(${(1.04 + Math.max(0, progress - 0.5) * 0.12).toFixed(4)});`}
        >
          <img
            src={images.spaces.src}
            srcset={images.spaces.srcset}
            sizes="100vw"
            alt={images.spaces.alt}
            width={images.spaces.width}
            height={images.spaces.height}
            style={images.spaces.objectPosition
              ? `object-position: ${images.spaces.objectPosition}`
              : undefined}
            loading="eager"
            decoding="async"
          />
        </div>

        <div
          class="story-bg-layer"
          style={`opacity: ${reduced ? 0 : (actWeights[3] ?? 0).toFixed(3)}; transform: scale(${(1.08 - Math.max(0, progress - 0.78) * 0.08).toFixed(4)});`}
        >
          <img
            src={images.students.src}
            srcset={images.students.srcset}
            sizes="100vw"
            alt={images.students.alt}
            width={images.students.width}
            height={images.students.height}
            style={images.students.objectPosition
              ? `object-position: ${images.students.objectPosition}`
              : undefined}
            loading="eager"
            decoding="async"
          />
        </div>

        <div class="story-scrim"></div>
      </div>

      <!-- Foreground narrative acts -->
      <div class="container story-foreground">
        <!-- ACT 01: Opening -->
        <div
          class="story-act"
          class:is-active={reduced || activeAct === 0}
          style={reduced
            ? undefined
            : `opacity: ${(actWeights[0] ?? 0).toFixed(3)}; transform: translateY(${((1 - (actWeights[0] ?? 0)) * -28).toFixed(1)}px);`}
          inert={!reduced && activeAct !== 0 ? true : undefined}
        >
          <p class="act-badge">
            <span class="act-dot" aria-hidden="true"></span>
            <span>01 · Aquarela · Paulista/PE</span>
          </p>
          <h1 class="act-h1">{heroTitle}</h1>
          <p class="act-lead">{heroSupport || tagline}</p>
          <div class="act-actions">
            <a class="story-btn story-btn--red focus-on-navy" href="/visite">
              <span>Quero conhecer</span>
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              class="story-btn story-btn--glass focus-on-navy"
              onclick={() => jumpToAct(1)}
            >
              <span>Iniciar jornada</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
          <p class="scroll-whisper" aria-hidden="true">
            <span class="scroll-line"></span>
            <span>Role para revelar os 4 momentos do Aquarela</span>
          </p>
        </div>

        <!-- ACT 02: Teaching Stages -->
        <div
          class="story-act"
          class:is-active={reduced || activeAct === 1}
          style={reduced
            ? undefined
            : `opacity: ${(actWeights[1] ?? 0).toFixed(3)}; transform: translateY(${((1 - (actWeights[1] ?? 0)) * 34).toFixed(1)}px);`}
          inert={!reduced && activeAct !== 1 ? true : undefined}
        >
          <p class="act-badge">
            <span class="act-dot" aria-hidden="true"></span>
            <span>02 · Da Educação Infantil ao Ensino Médio</span>
          </p>
          <h2 class="act-h2">Acompanhamento em cada fase.</h2>
          <div class="stage-pills-grid">
            {#each segments as seg (seg.slug)}
              <a
                href={`/ensino#${seg.slug}`}
                class="stage-glass-card focus-on-navy"
              >
                <span class="stage-card-top">
                  <span class="stage-num">{seg.num}</span>
                  <span aria-hidden="true">↗</span>
                </span>
                <strong>{seg.name}</strong>
                <span class="stage-shifts">
                  {seg.shifts.map((s) => s.split(':')[0]).join(' · ')}
                </span>
              </a>
            {/each}
          </div>
        </div>

        <!-- ACT 03: Real School Spaces -->
        <div
          class="story-act"
          class:is-active={reduced || activeAct === 2}
          style={reduced
            ? undefined
            : `opacity: ${(actWeights[2] ?? 0).toFixed(3)}; transform: translateY(${((1 - (actWeights[2] ?? 0)) * 34).toFixed(1)}px);`}
          inert={!reduced && activeAct !== 2 ? true : undefined}
        >
          <p class="act-badge">
            <span class="act-dot" aria-hidden="true"></span>
            <span>03 · Estrutura que educa</span>
          </p>
          <h2 class="act-h2">
            {environmentsCount} ambientes feitos para descobrir.
          </h2>
          <p class="act-lead">
            Salas equipadas, laboratório, esportes e convivência integrados ao
            dia a dia dos estudantes.
          </p>
          <div class="space-chips" aria-label="Destaques dos ambientes">
            {#each environmentHighlights as envName (envName)}
              <span class="space-chip">{envName}</span>
            {/each}
          </div>
          <div class="act-actions">
            <a
              class="story-btn story-btn--white focus-on-navy"
              href="/nosso-espaco"
            >
              <span>Explorar nosso espaço</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <!-- ACT 04: Approvals & Visit CTA -->
        <div
          class="story-act"
          class:is-active={reduced || activeAct === 3}
          style={reduced
            ? undefined
            : `opacity: ${(actWeights[3] ?? 0).toFixed(3)}; transform: translateY(${((1 - (actWeights[3] ?? 0)) * 34).toFixed(1)}px);`}
          inert={!reduced && activeAct !== 3 ? true : undefined}
        >
          <p class="act-badge">
            <span class="act-dot" aria-hidden="true"></span>
            <span>04 · Trajetórias reais</span>
          </p>
          <h2 class="act-h2">Conquistas que abrem caminhos.</h2>
          {#if approvals.length > 0}
            <div class="story-approvals">
              {#each approvals as person (person.name)}
                <div class="story-approval-pill">
                  {#if person.portraitUrl}
                    <img
                      src={person.portraitUrl}
                      alt={person.portraitAlt}
                      width="44"
                      height="44"
                      loading="eager"
                    />
                  {/if}
                  <div class="story-approval-text">
                    <strong>{person.name}</strong>
                    <span>{person.summary}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
          <div class="act-actions">
            <a class="story-btn story-btn--red focus-on-navy" href="/visite">
              <span>Agendar visita</span>
              <span aria-hidden="true">↗</span>
            </a>
            {#if whatsappHref}
              <a
                class="story-btn story-btn--glass focus-on-navy"
                href={whatsappHref}
                target="_blank"
                rel="noopener"
              >
                <span>Conversar no WhatsApp</span>
                <span aria-hidden="true">↗</span>
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Precision Cula-inspired bottom chapter progress bar -->
      {#if !reduced}
        <div class="story-hud">
          <div class="container story-hud-inner">
            <div class="hud-tabs" role="tablist" aria-label="Atos da história">
              {#each actLabels as act, idx (act.num)}
                <button
                  type="button"
                  role="tab"
                  class="hud-tab focus-on-navy"
                  class:is-current={activeAct === idx}
                  aria-selected={activeAct === idx}
                  onclick={() => jumpToAct(idx)}
                >
                  <span class="hud-bar" aria-hidden="true">
                    <span
                      class="hud-fill"
                      style={`transform: scaleX(${clamp01(progress * actCount - idx).toFixed(3)})`}
                    ></span>
                  </span>
                  <span class="hud-meta">
                    <span class="hud-num">{act.num}</span>
                    <span class="hud-label">{act.label}</span>
                  </span>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .story-runway {
    position: relative;
    height: 360svh;
    background: var(--surface-dark);
  }

  .story-runway.is-reduced {
    height: auto;
  }

  .story-sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    width: 100%;
    overflow: hidden;
    background: #07121b;
  }

  .story-runway.is-reduced .story-sticky {
    position: relative;
    height: auto;
    overflow: visible;
  }

  .story-frame {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: inset(
      calc((1 - var(--aperture, 1)) * 8px) calc((1 - var(--aperture, 1)) * 8px)
        calc((1 - var(--aperture, 1)) * 8px)
        calc((1 - var(--aperture, 1)) * 8px) round
        calc((1 - var(--aperture, 1)) * 24px)
    );
  }

  .story-runway.is-reduced .story-frame {
    clip-path: none;
    padding-top: calc(var(--site-header-height) + 28px);
    padding-bottom: 40px;
  }

  .story-bg-stack {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .story-bg-layer {
    position: absolute;
    inset: 0;
    will-change: opacity, transform;
  }

  .story-bg-layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .story-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(7, 18, 28, 0.44) 0%,
      rgba(7, 18, 28, 0.36) 28%,
      rgba(7, 18, 28, 0.78) 68%,
      rgba(7, 18, 28, 0.94) 100%
    );
  }

  .story-foreground {
    position: relative;
    z-index: 2;
    height: 100%;
    display: grid;
    align-items: end;
    padding-top: calc(var(--site-header-height) + 16px);
    padding-bottom: 132px;
  }

  .story-runway.is-reduced .story-foreground {
    display: flex;
    flex-direction: column;
    gap: 44px;
    padding-bottom: 12px;
  }

  .story-act {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.8rem, 1.8vh, 1.35rem);
    max-width: 54rem;
    pointer-events: none;
    will-change: opacity, transform;
  }

  .story-act.is-active {
    pointer-events: auto;
  }

  .story-runway.is-reduced .story-act {
    position: relative;
    pointer-events: auto;
    opacity: 1 !important;
    transform: none !important;
  }

  .act-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 6px 13px;
    border-radius: var(--radius-pill);
    background: rgba(9, 22, 33, 0.64);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff;
  }

  .act-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--brand-yellow);
    box-shadow: 0 0 0 3px rgba(245, 184, 0, 0.28);
    flex-shrink: 0;
  }

  .act-h1,
  .act-h2 {
    margin: 0;
    color: #ffffff;
    font-size: min(
      calc(clamp(2rem, 7.2vw, 4.75rem) * var(--display-scale)),
      11vw
    );
    max-width: 15ch;
    text-shadow: 0 12px 34px rgba(0, 0, 0, 0.44);
  }

  .act-lead {
    margin: 0;
    font-size: clamp(0.96875rem, 1.65vw, 1.25rem);
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.9);
    max-width: 46ch;
  }

  .act-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    margin-top: 2px;
  }

  .story-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 46px;
    padding: 11px 14px;
    border-radius: var(--radius-pill);
    border: 1px solid transparent;
    font-size: 0.875rem;
    font-weight: 700;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    flex: 1 1 135px;
    transition:
      transform 220ms var(--ease),
      background-color 220ms var(--ease);
  }

  .story-btn--red {
    background: var(--action-primary);
    color: #ffffff;
    box-shadow: var(--shadow-action);
  }

  .story-btn--white {
    background: #ffffff;
    color: var(--surface-dark);
  }

  .story-btn--glass {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.32);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #ffffff;
  }

  @media (hover: hover) {
    .story-btn:hover {
      transform: translateY(-2px);
    }
    .story-btn--red:hover {
      background: var(--action-hover);
    }
    .story-btn--glass:hover {
      background: rgba(255, 255, 255, 0.24);
    }
  }

  .scroll-whisper {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 4px 0 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.78);
  }

  .scroll-line {
    width: 24px;
    height: 2px;
    background: var(--brand-yellow);
    border-radius: 2px;
  }

  /* Act 02: 4 interactive stage cards */
  .stage-pills-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
  }

  .stage-glass-card {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 13px 14px;
    border-radius: 18px;
    background: rgba(9, 22, 33, 0.66);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #ffffff;
    text-decoration: none;
    transition:
      background-color 220ms var(--ease),
      transform 220ms var(--ease);
  }

  .stage-glass-card:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateY(-2px);
  }

  .stage-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.72);
  }

  .stage-num {
    font-family: var(--font-display);
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--brand-yellow);
  }

  .stage-glass-card strong {
    font-family: var(--font-display);
    font-size: 0.76rem;
    line-height: 1.28;
    color: #ffffff;
  }

  .stage-shifts {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.78);
  }

  /* Act 03: Spaces chips */
  .space-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .space-chip {
    display: inline-flex;
    align-items: center;
    padding: 8px 13px;
    border-radius: var(--radius-pill);
    background: rgba(9, 22, 33, 0.66);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
  }

  /* Act 04: Approvals */
  .story-approvals {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    width: 100%;
    max-width: 44rem;
  }

  .story-approval-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(9, 22, 33, 0.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .story-approval-pill img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.35);
  }

  .story-approval-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .story-approval-text strong {
    font-family: var(--font-display);
    font-size: 0.78rem;
    color: #ffffff;
    line-height: 1.25;
  }

  .story-approval-text span {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Precision bottom HUD */
  .story-hud {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(64px + env(safe-area-inset-bottom, 0px));
    z-index: 4;
    pointer-events: none;
  }

  .story-hud-inner {
    pointer-events: auto;
  }

  .hud-tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    max-width: 560px;
  }

  .hud-tab {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 2px;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.65);
    text-align: left;
    cursor: pointer;
    transition: color 200ms var(--ease);
  }

  .hud-tab.is-current,
  .hud-tab:hover {
    color: #ffffff;
  }

  .hud-bar {
    display: block;
    width: 100%;
    height: 3px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.24);
    overflow: hidden;
  }

  .hud-fill {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--brand-yellow);
    transform-origin: left center;
  }

  .hud-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.6875rem;
    font-weight: 700;
  }

  .hud-num {
    font-family: var(--font-display);
    font-size: 0.62rem;
    color: var(--brand-yellow);
  }

  .hud-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (min-width: 640px) {
    .story-hud {
      bottom: max(16px, env(safe-area-inset-bottom, 0px));
    }
    .story-foreground {
      padding-bottom: 98px;
    }
    .act-actions {
      width: auto;
    }
    .story-btn {
      flex: 0 0 auto;
      padding: 12px 22px;
      font-size: 0.9375rem;
    }
    .story-approvals {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (min-width: 960px) {
    .story-foreground {
      padding-bottom: 108px;
    }
    .stage-pills-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }
    .stage-glass-card {
      padding: 18px;
    }
    .stage-glass-card strong {
      font-size: 0.85rem;
    }
  }
</style>
