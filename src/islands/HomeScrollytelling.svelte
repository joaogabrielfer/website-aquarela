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
  let topBarEl: HTMLElement | undefined = $state();

  // Direct DOM refs for 60/120fps GPU transforms without per-frame Svelte reactivity
  let bg0El: HTMLElement | undefined = $state();
  let bg1El: HTMLElement | undefined = $state();
  let bg2El: HTMLElement | undefined = $state();
  let bg3El: HTMLElement | undefined = $state();

  let act0El: HTMLElement | undefined = $state();
  let act1El: HTMLElement | undefined = $state();
  let act2El: HTMLElement | undefined = $state();
  let act3El: HTMLElement | undefined = $state();

  let act0Items: (HTMLElement | null)[] = [];
  let stageCardEls: (HTMLElement | null)[] = [];
  let spaceChipEls: (HTMLElement | null)[] = [];
  let approvalEls: (HTMLElement | null)[] = [];
  let hudFillEls: (HTMLElement | null)[] = [];

  // Only reactive state that changes rarely (4 discrete acts + reduced-motion flag)
  let activeAct = $state(0);
  let reduced = $state(false);

  const actLabels = [
    { num: '01', label: 'Aquarela', anchor: 0.0 },
    { num: '02', label: 'Ensino', anchor: 0.36 },
    { num: '03', label: 'Espaços', anchor: 0.68 },
    { num: '04', label: 'Futuro', anchor: 0.96 },
  ];

  // Cached layout geometry — updated only on resize/ResizeObserver, never during scroll
  let cachedTop = 0;
  let cachedScrollable = 1;
  let isCoarse = false;
  let jumpRaf = 0;

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

  const measureGeometry = () => {
    if (!runwayEl) return;
    const rect = runwayEl.getBoundingClientRect();
    cachedTop = window.scrollY + rect.top;
    const vh = window.innerHeight || 1;
    cachedScrollable = Math.max(1, runwayEl.offsetHeight - vh);
  };

  const applyFrame = (p: number) => {
    if (reduced) return;

    // Smooth non-linear act weights with gentle overlap (zero dead zones)
    const in0 = 1;
    const out0 = 1 - smoothstep(0.13, 0.27, p);
    const w0 = in0 * out0;

    const in1 = smoothstep(0.18, 0.31, p);
    const out1 = 1 - smoothstep(0.47, 0.59, p);
    const w1 = in1 * out1;

    const in2 = smoothstep(0.51, 0.63, p);
    const out2 = 1 - smoothstep(0.76, 0.87, p);
    const w2 = in2 * out2;

    const in3 = smoothstep(0.79, 0.91, p);
    const w3 = in3;

    // Update discrete activeAct only when crossing midpoints
    const nextAct = p < 0.23 ? 0 : p < 0.54 ? 1 : p < 0.82 ? 2 : 3;
    if (nextAct !== activeAct) activeAct = nextAct;

    // Top spectrum hairline
    if (topBarEl) {
      topBarEl.style.transform = `scaleX(${Math.max(0.02, p).toFixed(4)})`;
    }

    // 1. Living photographic background layers (continuous GPU zoom + vertical drift)
    if (bg0El) {
      const op = Math.max(0.12, w0);
      const sc = 1.0 + p * 0.14;
      const ty = -p * 3.5;
      bg0El.style.opacity = op.toFixed(3);
      bg0El.style.transform = `translate3d(0, ${ty.toFixed(2)}%, 0) scale(${sc.toFixed(4)})`;
    }
    if (bg1El) {
      const local = clamp01((p - 0.15) / 0.45);
      const sc = 1.13 - local * 0.11;
      const ty = (1 - local) * 2.4 - 1.0;
      bg1El.style.opacity = w1.toFixed(3);
      bg1El.style.visibility = w1 > 0.004 ? 'visible' : 'hidden';
      bg1El.style.transform = `translate3d(0, ${ty.toFixed(2)}%, 0) scale(${sc.toFixed(4)})`;
    }
    if (bg2El) {
      const local = clamp01((p - 0.48) / 0.42);
      const sc = 1.02 + local * 0.11;
      const ty = (0.5 - local) * 2.5;
      bg2El.style.opacity = w2.toFixed(3);
      bg2El.style.visibility = w2 > 0.004 ? 'visible' : 'hidden';
      bg2El.style.transform = `translate3d(0, ${ty.toFixed(2)}%, 0) scale(${sc.toFixed(4)})`;
    }
    if (bg3El) {
      const local = clamp01((p - 0.76) / 0.24);
      const sc = 1.11 - local * 0.09;
      const ty = (1 - local) * 2.0;
      bg3El.style.opacity = w3.toFixed(3);
      bg3El.style.visibility = w3 > 0.004 ? 'visible' : 'hidden';
      bg3El.style.transform = `translate3d(0, ${ty.toFixed(2)}%, 0) scale(${sc.toFixed(4)})`;
    }

    // 2. Act 01: Immediate staggered upward parallax from pixel 1 of scroll
    if (act0El) {
      act0El.style.opacity = w0.toFixed(3);
      act0El.style.visibility = w0 > 0.005 ? 'visible' : 'hidden';
      const drift = clamp01(p / 0.26);
      const speeds = [14, 28, 38, 50, 58];
      for (let i = 0; i < act0Items.length; i++) {
        const el = act0Items[i];
        if (!el) continue;
        const dy = -drift * (speeds[i] ?? 32);
        el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
      }
    }

    // 3. Act 02: Staggered wave entrance for the 4 stage cards
    if (act1El) {
      const enterY = (1 - easeOutCubic(in1)) * 28;
      const exitY = (1 - out1) * -26;
      act1El.style.opacity = w1.toFixed(3);
      act1El.style.visibility = w1 > 0.005 ? 'visible' : 'hidden';
      act1El.style.transform = `translate3d(0, ${(enterY + exitY).toFixed(1)}px, 0)`;

      for (let i = 0; i < stageCardEls.length; i++) {
        const card = stageCardEls[i];
        if (!card) continue;
        const stagger = easeOutCubic(clamp01((p - (0.19 + i * 0.024)) / 0.11));
        const cardY = (1 - stagger) * 24;
        const cardScale = 0.96 + stagger * 0.04;
        card.style.opacity = stagger.toFixed(3);
        card.style.transform = `translate3d(0, ${cardY.toFixed(1)}px, 0) scale(${cardScale.toFixed(4)})`;
      }
    }

    // 4. Act 03: Spaces kinetic reveal with cascading chips
    if (act2El) {
      const enterY = (1 - easeOutCubic(in2)) * 28;
      const exitY = (1 - out2) * -26;
      act2El.style.opacity = w2.toFixed(3);
      act2El.style.visibility = w2 > 0.005 ? 'visible' : 'hidden';
      act2El.style.transform = `translate3d(0, ${(enterY + exitY).toFixed(1)}px, 0)`;

      for (let i = 0; i < spaceChipEls.length; i++) {
        const chip = spaceChipEls[i];
        if (!chip) continue;
        const stagger = easeOutCubic(clamp01((p - (0.52 + i * 0.016)) / 0.1));
        const chipY = (1 - stagger) * 16;
        chip.style.opacity = stagger.toFixed(3);
        chip.style.transform = `translate3d(0, ${chipY.toFixed(1)}px, 0)`;
      }
    }

    // 5. Act 04: Approvals cascade + Visit climax
    if (act3El) {
      const enterY = (1 - easeOutCubic(in3)) * 28;
      act3El.style.opacity = w3.toFixed(3);
      act3El.style.visibility = w3 > 0.005 ? 'visible' : 'hidden';
      act3El.style.transform = `translate3d(0, ${enterY.toFixed(1)}px, 0)`;

      for (let i = 0; i < approvalEls.length; i++) {
        const card = approvalEls[i];
        if (!card) continue;
        const stagger = easeOutCubic(clamp01((p - (0.79 + i * 0.025)) / 0.1));
        const cardY = (1 - stagger) * 20;
        card.style.opacity = stagger.toFixed(3);
        card.style.transform = `translate3d(0, ${cardY.toFixed(1)}px, 0)`;
      }
    }

    // 6. Bottom 4-segment progress fills (pure scaleX GPU)
    const count = actLabels.length;
    for (let i = 0; i < hudFillEls.length; i++) {
      const fill = hudFillEls[i];
      if (!fill) continue;
      const segP = clamp01(p * count - i);
      fill.style.transform = `scaleX(${segP.toFixed(4)})`;
    }
  };

  const smoothScrollTo = (targetY: number) => {
    if (jumpRaf) window.cancelAnimationFrame(jumpRaf);
    if (reduced) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const duration = Math.min(720, Math.max(380, Math.abs(distance) * 0.42));
    const startTime = performance.now();

    const step = (now: number) => {
      const t = clamp01((now - startTime) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, startY + distance * eased);
      if (t < 1) {
        jumpRaf = window.requestAnimationFrame(step);
      } else {
        jumpRaf = 0;
      }
    };

    jumpRaf = window.requestAnimationFrame(step);
  };

  const jumpToAct = (idx: number) => {
    measureGeometry();
    const targetY =
      cachedTop + cachedScrollable * (actLabels[idx]?.anchor ?? 0);
    smoothScrollTo(targetY);
  };

  onMount(() => {
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    isCoarse = mqCoarse.matches;

    let displayP = 0;
    let targetP = 0;
    let raf = 0;
    let lastTime = 0;

    const readTarget = () =>
      clamp01((window.scrollY - cachedTop) / cachedScrollable);

    const tick = (now: number) => {
      raf = 0;
      if (reduced) return;

      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
      lastTime = now;

      targetP = readTarget();
      const diff = targetP - displayP;

      if (Math.abs(diff) < 0.0004) {
        displayP = targetP;
        applyFrame(displayP);
        lastTime = 0;
        return;
      }

      // Frame-rate independent exponential damping: crisp on touch, silky on desktop
      const speed = isCoarse ? 22 : 13;
      const alpha = 1 - Math.exp(-speed * dt);
      displayP += diff * alpha;
      applyFrame(displayP);

      raf = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (reduced) return;
      targetP = readTarget();
      if (!raf) {
        lastTime = performance.now();
        raf = window.requestAnimationFrame(tick);
      }
    };

    const syncReduced = () => {
      reduced =
        mqReduced.matches ||
        document.documentElement.dataset.motion === 'reduced';
      if (!reduced) {
        measureGeometry();
        displayP = readTarget();
        targetP = displayP;
        applyFrame(displayP);
      }
    };

    const cancelJumpOnUserInput = () => {
      if (jumpRaf) {
        window.cancelAnimationFrame(jumpRaf);
        jumpRaf = 0;
      }
    };

    const onResize = () => {
      isCoarse = mqCoarse.matches;
      measureGeometry();
      if (!reduced) {
        displayP = readTarget();
        targetP = displayP;
        applyFrame(displayP);
      }
    };

    syncReduced();

    const ro =
      typeof ResizeObserver !== 'undefined' && runwayEl
        ? new ResizeObserver(() => onResize())
        : null;
    if (ro && runwayEl) ro.observe(runwayEl);

    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('wheel', cancelJumpOnUserInput, { passive: true });
    window.addEventListener('touchstart', cancelJumpOnUserInput, {
      passive: true,
    });
    mqReduced.addEventListener('change', syncReduced);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (jumpRaf) window.cancelAnimationFrame(jumpRaf);
      ro?.disconnect();
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('wheel', cancelJumpOnUserInput);
      window.removeEventListener('touchstart', cancelJumpOnUserInput);
      mqReduced.removeEventListener('change', syncReduced);
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
    <div class="story-frame">
      {#if !reduced}
        <div class="story-top-progress" aria-hidden="true">
          <span class="story-top-progress-fill" bind:this={topBarEl}></span>
        </div>
      {/if}

      <!-- Living background photographic layers (pure GPU translate3d + scale + opacity) -->
      <div class="story-bg-stack" aria-hidden="true">
        <div class="story-bg-layer is-first" bind:this={bg0El}>
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

        <div class="story-bg-layer" bind:this={bg1El}>
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

        <div class="story-bg-layer" bind:this={bg2El}>
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

        <div class="story-bg-layer" bind:this={bg3El}>
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
          class="story-act is-first"
          class:is-active={reduced || activeAct === 0}
          bind:this={act0El}
          inert={!reduced && activeAct !== 0 ? true : undefined}
        >
          <p class="act-badge" bind:this={act0Items[0]}>
            <span class="act-dot" aria-hidden="true"></span>
            <span>01 · Aquarela · Paulista/PE</span>
          </p>
          <h1 class="act-h1" bind:this={act0Items[1]}>{heroTitle}</h1>
          <p class="act-lead" bind:this={act0Items[2]}>
            {heroSupport || tagline}
          </p>
          <div class="act-actions" bind:this={act0Items[3]}>
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
          <p class="scroll-whisper" aria-hidden="true" bind:this={act0Items[4]}>
            <span class="scroll-line"></span>
            <span>Role para revelar os 4 momentos do Aquarela</span>
          </p>
        </div>

        <!-- ACT 02: Teaching Stages -->
        <div
          class="story-act"
          class:is-active={reduced || activeAct === 1}
          bind:this={act1El}
          inert={!reduced && activeAct !== 1 ? true : undefined}
        >
          <p class="act-badge">
            <span class="act-dot" aria-hidden="true"></span>
            <span>02 · Infantil ao Ensino Médio</span>
          </p>
          <h2 class="act-h2">Acompanhamento em cada fase.</h2>
          <div class="stage-pills-grid">
            {#each segments as seg, i (seg.slug)}
              <a
                href={`/ensino#${seg.slug}`}
                class="stage-glass-card focus-on-navy"
                bind:this={stageCardEls[i]}
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
          bind:this={act2El}
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
            {#each environmentHighlights as envName, i (envName)}
              <span class="space-chip" bind:this={spaceChipEls[i]}>
                {envName}
              </span>
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
          bind:this={act3El}
          inert={!reduced && activeAct !== 3 ? true : undefined}
        >
          <p class="act-badge">
            <span class="act-dot" aria-hidden="true"></span>
            <span>04 · Trajetórias reais</span>
          </p>
          <h2 class="act-h2">Conquistas que abrem caminhos.</h2>
          {#if approvals.length > 0}
            <div class="story-approvals">
              {#each approvals as person, i (person.name)}
                <div class="story-approval-pill" bind:this={approvalEls[i]}>
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
                <span>WhatsApp</span>
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
                    <span class="hud-fill" bind:this={hudFillEls[idx]}></span>
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
    height: 285svh;
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
    contain: layout style paint;
  }

  .story-runway.is-reduced .story-sticky {
    position: relative;
    height: auto;
    overflow: visible;
    contain: none;
  }

  .story-frame {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .story-runway.is-reduced .story-frame {
    padding-top: calc(var(--site-header-height) + 28px);
    padding-bottom: 40px;
  }

  .story-top-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 6;
    background: rgba(255, 255, 255, 0.14);
    pointer-events: none;
  }

  .story-top-progress-fill {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--aquarela-spectrum);
    transform-origin: left center;
    transform: scaleX(0.02);
    will-change: transform;
  }

  .story-bg-stack {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .story-bg-layer {
    position: absolute;
    inset: -3%;
    opacity: 0;
    visibility: hidden;
    will-change: opacity, transform;
    backface-visibility: hidden;
  }

  .story-bg-layer.is-first {
    opacity: 1;
    visibility: visible;
  }

  .story-runway.is-reduced .story-bg-layer {
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transform: none !important;
  }

  .story-runway.is-reduced .story-bg-layer.is-first {
    opacity: 1;
    visibility: visible;
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
      rgba(7, 18, 28, 0.34) 28%,
      rgba(7, 18, 28, 0.78) 68%,
      rgba(7, 18, 28, 0.95) 100%
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
    gap: clamp(0.8rem, 1.8vh, 1.3rem);
    max-width: 54rem;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    will-change: opacity, transform;
  }

  .story-act.is-first {
    opacity: 1;
    visibility: visible;
  }

  .story-act.is-active {
    pointer-events: auto;
  }

  .story-runway.is-reduced .story-act {
    position: relative;
    pointer-events: auto;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }

  .act-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 6px 13px;
    border-radius: var(--radius-pill);
    background: rgba(9, 22, 33, 0.84);
    border: 1px solid rgba(255, 255, 255, 0.22);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff;
    will-change: transform;
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
    will-change: transform;
  }

  .act-lead {
    margin: 0;
    font-size: clamp(0.96875rem, 1.65vw, 1.25rem);
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.92);
    max-width: 46ch;
    will-change: transform;
  }

  .act-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    margin-top: 2px;
    will-change: transform;
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
    background: rgba(12, 28, 41, 0.72);
    border-color: rgba(255, 255, 255, 0.34);
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
      background: rgba(255, 255, 255, 0.22);
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
    color: rgba(255, 255, 255, 0.82);
    will-change: transform;
  }

  .scroll-line {
    width: 24px;
    height: 2px;
    background: var(--brand-yellow);
    border-radius: 2px;
    animation: whisper-pulse 2.2s ease-in-out infinite;
  }

  @keyframes whisper-pulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scaleX(0.8);
    }
    50% {
      opacity: 1;
      transform: scaleX(1.15);
    }
  }

  /* Act 02: 4 interactive stage cards (obsidian glass without GPU blur stall) */
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
    background: rgba(9, 22, 33, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 14px 32px -18px rgba(0, 0, 0, 0.65);
    color: #ffffff;
    text-decoration: none;
    will-change: transform, opacity;
    transition: background-color 200ms var(--ease);
  }

  .story-runway.is-reduced .stage-glass-card,
  .story-runway.is-reduced .space-chip,
  .story-runway.is-reduced .story-approval-pill {
    opacity: 1 !important;
    transform: none !important;
  }

  .stage-glass-card:hover {
    background: rgba(20, 44, 64, 0.94);
  }

  .stage-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.74);
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
    color: rgba(255, 255, 255, 0.8);
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
    background: rgba(9, 22, 33, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
    will-change: transform, opacity;
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
    background: rgba(9, 22, 33, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 14px 32px -18px rgba(0, 0, 0, 0.6);
    will-change: transform, opacity;
  }

  .story-approval-pill img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    object-position: 50% 22%;
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
    color: rgba(255, 255, 255, 0.82);
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
    color: rgba(255, 255, 255, 0.66);
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
    transform: scaleX(0);
    will-change: transform;
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
    .story-runway {
      height: 315svh;
    }
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
