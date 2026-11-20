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

  let deckEl: HTMLElement | undefined = $state();

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

  const actLabels = [
    { num: '01', label: 'Aquarela' },
    { num: '02', label: 'Ensino' },
    { num: '03', label: 'Espaços' },
    { num: '04', label: 'Futuro' },
  ];
  const LAST_ACT = actLabels.length - 1;

  // Discrete reactive state — only changes when locking into a new act
  let activeAct = $state(0);
  let reduced = $state(false);
  let isTouch = $state(false);

  // Continuous virtual stage position: 0.0 (Act 0) .. 3.0 (Act 3)
  let stagePos = 0;
  let animRaf = 0;
  let isAnimating = false;
  let wheelCooldownUntil = 0;

  const clamp = (v: number, min: number, max: number) =>
    v < min ? min : v > max ? max : v;
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  // Smooth quartic-out deceleration (feels like luxury Lenis inertia landing cleanly)
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
  const easeInOutQuart = (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

  /**
   * Renders the entire 4-act cinematic deck at any continuous virtual coordinate
   * `s` in [0, 3]. During touch drag, `s` follows the thumb directly; on release
   * or wheel impulse, `s` glides luxuriously and locks on an exact integer act.
   */
  const renderStage = (s: number) => {
    if (reduced) return;

    const clamped = clamp(s, 0, LAST_ACT);
    const nearest = Math.round(clamped);
    if (nearest !== activeAct) activeAct = nearest;

    // 1. Living photographic background layers (GPU crossfade + parallax depth zoom)
    const bgEls = [bg0El, bg1El, bg2El, bg3El];
    for (let i = 0; i < bgEls.length; i++) {
      const el = bgEls[i];
      if (!el) continue;
      const dist = clamped - i; // 0 = centered on this act, +1 = passed, -1 = upcoming
      const absD = Math.abs(dist);
      // Soft overlapping dissolve so the canvas never flashes dark between acts
      const opacity =
        i === 0
          ? Math.max(0.18, clamp01(1 - absD * 1.12))
          : clamp01(1 - absD * 1.15);
      const scale =
        1.03 + Math.min(absD, 1.2) * 0.08 + (dist > 0 ? dist * 0.03 : 0);
      const translateY = clamp(-dist * 3.8, -5, 5);

      el.style.opacity = opacity.toFixed(3);
      el.style.visibility = opacity > 0.004 ? 'visible' : 'hidden';
      el.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
    }

    // 2. Foreground Acts — crisp resting state at integer `s`, silky motion between acts
    // Act 01 (s = 0)
    if (act0El) {
      const d = clamped - 0; // 0..1 as leaving
      const vis = clamp01(1 - d * 1.65);
      act0El.style.opacity = vis.toFixed(3);
      act0El.style.visibility = vis > 0.005 ? 'visible' : 'hidden';
      const speeds = [16, 30, 42, 54, 62];
      for (let i = 0; i < act0Items.length; i++) {
        const el = act0Items[i];
        if (!el) continue;
        const dy = -d * (speeds[i] ?? 34);
        el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
      }
    }

    // Act 02 (s = 1) — 4 stage cards cascade into their exact resting grid
    if (act1El) {
      const d = clamped - 1; // -1 (entering) -> 0 (locked) -> +1 (leaving)
      const vis = clamp01(1 - Math.abs(d) * 1.6);
      const containerY = d < 0 ? -d * 34 : -d * 36;
      act1El.style.opacity = vis.toFixed(3);
      act1El.style.visibility = vis > 0.005 ? 'visible' : 'hidden';
      act1El.style.transform = `translate3d(0, ${containerY.toFixed(1)}px, 0)`;

      for (let i = 0; i < stageCardEls.length; i++) {
        const card = stageCardEls[i];
        if (!card) continue;
        // Staggered arrival as s approaches 1 from below; clean lift as leaving
        const local =
          d < 0
            ? easeOutQuart(clamp01((1 + d - i * 0.075) / 0.62))
            : clamp01(1 - d * 1.5);
        const cardY = d < 0 ? (1 - local) * 26 : -d * (14 + i * 4);
        const cardScale = 0.96 + local * 0.04;
        card.style.opacity = local.toFixed(3);
        card.style.transform = `translate3d(0, ${cardY.toFixed(1)}px, 0) scale(${cardScale.toFixed(4)})`;
      }
    }

    // Act 03 (s = 2) — Spaces chips cascade cleanly
    if (act2El) {
      const d = clamped - 2;
      const vis = clamp01(1 - Math.abs(d) * 1.6);
      const containerY = d < 0 ? -d * 34 : -d * 36;
      act2El.style.opacity = vis.toFixed(3);
      act2El.style.visibility = vis > 0.005 ? 'visible' : 'hidden';
      act2El.style.transform = `translate3d(0, ${containerY.toFixed(1)}px, 0)`;

      for (let i = 0; i < spaceChipEls.length; i++) {
        const chip = spaceChipEls[i];
        if (!chip) continue;
        const local =
          d < 0
            ? easeOutQuart(clamp01((1 + d - i * 0.055) / 0.62))
            : clamp01(1 - d * 1.5);
        const chipY = d < 0 ? (1 - local) * 18 : -d * 14;
        chip.style.opacity = local.toFixed(3);
        chip.style.transform = `translate3d(0, ${chipY.toFixed(1)}px, 0)`;
      }
    }

    // Act 04 (s = 3) — Real approvals cascade + Visit CTA climax
    if (act3El) {
      const d = clamped - 3; // -1 -> 0
      const vis = clamp01(1 - Math.abs(d) * 1.6);
      const containerY = -d * 34;
      act3El.style.opacity = vis.toFixed(3);
      act3El.style.visibility = vis > 0.005 ? 'visible' : 'hidden';
      act3El.style.transform = `translate3d(0, ${containerY.toFixed(1)}px, 0)`;

      for (let i = 0; i < approvalEls.length; i++) {
        const card = approvalEls[i];
        if (!card) continue;
        const local = easeOutQuart(clamp01((1 + d - i * 0.085) / 0.62));
        const cardY = (1 - local) * 22;
        card.style.opacity = local.toFixed(3);
        card.style.transform = `translate3d(0, ${cardY.toFixed(1)}px, 0)`;
      }
    }

    // 3. Bottom 4-segment progress bars (filled for completed + current act)
    for (let i = 0; i < hudFillEls.length; i++) {
      const fill = hudFillEls[i];
      if (!fill) continue;
      // Active act fills completely to 1 when locked, smoothly advancing during drag
      const seg = clamp01(clamped - i + 1);
      fill.style.transform = `scaleX(${seg.toFixed(4)})`;
    }
  };

  const cancelAnim = () => {
    if (animRaf) {
      window.cancelAnimationFrame(animRaf);
      animRaf = 0;
    }
    isAnimating = false;
  };

  /**
   * Smoothly animates the deck to an exact target act index (0..3) and locks there.
   * Uses quartic-out when continuing from a live thumb drag, or in-out-quart for clicks.
   */
  const goToAct = (
    targetIdx: number,
    options?: { fromDrag?: boolean; durationMs?: number },
  ) => {
    const dest = clamp(Math.round(targetIdx), 0, LAST_ACT);
    if (reduced) {
      activeAct = dest;
      return;
    }

    cancelAnim();
    const startPos = stagePos;
    const delta = dest - startPos;
    if (Math.abs(delta) < 0.001) {
      stagePos = dest;
      renderStage(stagePos);
      return;
    }

    isAnimating = true;
    const fromDrag = options?.fromDrag ?? false;
    const baseDur = options?.durationMs ?? (fromDrag ? 680 : 820);
    // Scale slightly when jumping multiple acts via HUD tabs
    const duration = Math.min(
      1050,
      baseDur + Math.max(0, Math.abs(delta) - 1) * 140,
    );
    const startTime = performance.now();

    const step = (now: number) => {
      const t = clamp01((now - startTime) / duration);
      const eased = fromDrag ? easeOutQuart(t) : easeInOutQuart(t);
      stagePos = startPos + delta * eased;
      renderStage(stagePos);

      if (t < 1) {
        animRaf = window.requestAnimationFrame(step);
      } else {
        stagePos = dest;
        renderStage(stagePos);
        animRaf = 0;
        isAnimating = false;
      }
    };

    animRaf = window.requestAnimationFrame(step);
  };

  const scrollPastDeck = () => {
    if (!deckEl) return;
    const nextTop = deckEl.offsetTop + deckEl.offsetHeight;
    if (reduced) {
      window.scrollTo({ top: nextTop, behavior: 'auto' });
      return;
    }
    const startY = window.scrollY;
    const dist = nextTop - startY;
    const duration = 760;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = clamp01((now - startTime) / duration);
      window.scrollTo(0, startY + dist * easeInOutQuart(t));
      if (t < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  const isOverlayOpen = () =>
    document.documentElement.hasAttribute('data-menu-open') ||
    document.documentElement.hasAttribute('data-approval-overlay') ||
    document.body.style.overflow === 'hidden';

  const isInteractiveChrome = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        '.variant-lab, .site-header, .mobile-panel, .lightbox-backdrop',
      ),
    );
  };

  onMount(() => {
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    isTouch = mqCoarse.matches;

    const syncReduced = () => {
      reduced =
        mqReduced.matches ||
        document.documentElement.dataset.motion === 'reduced';
      if (!reduced) {
        renderStage(stagePos);
      }
    };
    syncReduced();

    // --- 1. Luxury Touch Observer (1 swipe up = 1 act, live drag-follow + elastic snap) ---
    let touchActive = false;
    let touchLockedAxis: 'none' | 'vertical' | 'horizontal' = 'none';
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchBaseAct = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let recentVelocity = 0; // px / ms (positive = finger moving up = next act)

    const onTouchStart = (e: TouchEvent) => {
      if (reduced || e.touches.length !== 1) return;
      if (
        window.scrollY > 4 ||
        isOverlayOpen() ||
        isInteractiveChrome(e.target)
      ) {
        touchActive = false;
        return;
      }

      const t = e.touches[0]!;
      touchActive = true;
      touchLockedAxis = 'none';
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      lastTouchY = t.clientY;
      touchStartTime = performance.now();
      lastTouchTime = touchStartTime;
      recentVelocity = 0;
      touchBaseAct = Math.round(stagePos);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive || reduced || e.touches.length !== 1) return;

      const t = e.touches[0]!;
      const dx = t.clientX - touchStartX;
      const dy = touchStartY - t.clientY; // positive = swipe UP (next act)

      if (touchLockedAxis === 'none') {
        if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          touchLockedAxis = 'horizontal';
          touchActive = false;
          return;
        }
        // Release cleanly to native scroll ONLY when fully settled at the boundary:
        // - Swiping DOWN on Act 0 (allows native iOS pull-to-refresh)
        // - Swiping UP on Act 3 once locked (releases smoothly into the rest of the page)
        if (
          (stagePos <= 0.04 && !isAnimating && dy < 0) ||
          (stagePos >= LAST_ACT - 0.04 && !isAnimating && dy > 0)
        ) {
          touchActive = false;
          return;
        }
        touchLockedAxis = 'vertical';
        cancelAnim();
      }

      if (touchLockedAxis !== 'vertical') return;

      // Prevent native momentum from blowing past acts
      if (e.cancelable) e.preventDefault();

      const now = performance.now();
      const dt = Math.max(1, now - lastTouchTime);
      const instantVel = (lastTouchY - t.clientY) / dt;
      recentVelocity = recentVelocity * 0.55 + instantVel * 0.45;
      lastTouchY = t.clientY;
      lastTouchTime = now;

      // Live tactile scrub attached to the thumb, softly capped to +-0.62 act
      // so one swipe can NEVER fly past more than 1 act!
      const vh = window.innerHeight || 844;
      const rawDeltaAct = dy / (vh * 0.42);
      const dampedDelta =
        Math.sign(rawDeltaAct) * Math.min(0.62, Math.abs(rawDeltaAct) * 0.85);

      stagePos = clamp(touchBaseAct + dampedDelta, 0, LAST_ACT);
      renderStage(stagePos);
    };

    const onTouchEnd = () => {
      if (!touchActive || touchLockedAxis !== 'vertical' || reduced) {
        touchActive = false;
        return;
      }
      touchActive = false;

      const dragActs = stagePos - touchBaseAct;
      const elapsed = Math.max(1, performance.now() - touchStartTime);
      const avgVel = (dragActs * (window.innerHeight || 844) * 0.42) / elapsed;
      const velocity =
        Math.abs(recentVelocity) > 0.08 ? recentVelocity : avgVel;

      // Sensitive yet deliberate luxury threshold:
      // gentle swipe (~12% screen) OR quick flick commits to EXACTLY +-1 act
      let targetAct = touchBaseAct;
      if (dragActs > 0.12 || (dragActs > 0.04 && velocity > 0.28)) {
        targetAct = Math.min(LAST_ACT, touchBaseAct + 1);
      } else if (dragActs < -0.12 || (dragActs < -0.04 && velocity < -0.28)) {
        targetAct = Math.max(0, touchBaseAct - 1);
      }

      goToAct(targetAct, {
        fromDrag: true,
        durationMs: targetAct === touchBaseAct ? 420 : 680,
      });
    };

    // --- 2. Desktop Wheel / Trackpad Observer (capture phase before Lenis) ---
    let wheelDeltaAcc = 0;
    let wheelResetTimer = 0;

    const onWheel = (e: WheelEvent) => {
      if (
        reduced ||
        window.scrollY > 4 ||
        isOverlayOpen() ||
        isInteractiveChrome(e.target)
      ) {
        return;
      }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const cur = Math.round(stagePos);
      // Let normal Lenis scroll take over at boundaries
      if (e.deltaY > 0 && cur >= LAST_ACT) return;
      if (e.deltaY < 0 && cur <= 0) return;

      // Capture inside Acts 0..3 so one wheel/trackpad gesture moves 1 act cleanly
      e.preventDefault();
      e.stopPropagation();

      const now = performance.now();
      if (isAnimating || now < wheelCooldownUntil) return;

      wheelDeltaAcc += e.deltaY;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelDeltaAcc = 0;
      }, 160);

      if (Math.abs(wheelDeltaAcc) >= 24) {
        const dir = wheelDeltaAcc > 0 ? 1 : -1;
        wheelDeltaAcc = 0;
        wheelCooldownUntil = now + 760;
        goToAct(cur + dir, { fromDrag: false, durationMs: 820 });
      }
    };

    // --- 3. Keyboard navigation when at top of page ---
    const onKeydown = (e: KeyboardEvent) => {
      if (reduced || window.scrollY > 4 || isOverlayOpen()) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const cur = Math.round(stagePos);
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (cur < LAST_ACT) {
          e.preventDefault();
          goToAct(cur + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (cur > 0) {
          e.preventDefault();
          goToAct(cur - 1);
        }
      }
    };

    // Capture phase on wheel ensures we run before Lenis smooth-scroll
    window.addEventListener('wheel', onWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeydown);
    mqReduced.addEventListener('change', syncReduced);

    return () => {
      cancelAnim();
      window.clearTimeout(wheelResetTimer);
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeydown);
      mqReduced.removeEventListener('change', syncReduced);
    };
  });
</script>

<section
  class="story-deck"
  class:is-reduced={reduced}
  bind:this={deckEl}
  aria-label="Jornada interativa pelo Aquarela Colégio e Curso"
>
  <div class="story-stage">
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
            onclick={() => goToAct(1)}
          >
            <span>Iniciar jornada</span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
        <p class="scroll-whisper" aria-hidden="true" bind:this={act0Items[4]}>
          <span class="scroll-line"></span>
          <span>
            {isTouch
              ? 'Deslize para cima · 1 passo por tela'
              : 'Role suavemente · 1 ato por vez'}
          </span>
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
          Salas equipadas, laboratório, esportes e convivência integrados ao dia
          a dia dos estudantes.
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
        {#if !reduced}
          <button
            type="button"
            class="continue-cue focus-on-navy"
            onclick={scrollPastDeck}
          >
            <span class="scroll-line" aria-hidden="true"></span>
            <span>Continuar explorando o site ↓</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Precision bottom chapter progress bar -->
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
                onclick={() => goToAct(idx)}
              >
                <span class="hud-bar" aria-hidden="true">
                  <span
                    class="hud-fill"
                    style={idx === 0 ? 'transform: scaleX(1)' : undefined}
                    bind:this={hudFillEls[idx]}
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
</section>

<style>
  .story-deck {
    position: relative;
    height: 100svh;
    width: 100%;
    overflow: hidden;
    background: #07121b;
    overscroll-behavior-y: contain;
    contain: layout style paint;
  }

  .story-deck.is-reduced {
    height: auto;
    overflow: visible;
    contain: none;
  }

  .story-stage {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .story-deck.is-reduced .story-stage {
    height: auto;
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
    inset: -4%;
    opacity: 0;
    visibility: hidden;
    will-change: opacity, transform;
    backface-visibility: hidden;
  }

  .story-bg-layer.is-first {
    opacity: 1;
    visibility: visible;
    transform: scale(1.03);
  }

  .story-deck.is-reduced .story-bg-layer {
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transform: none !important;
  }

  .story-deck.is-reduced .story-bg-layer.is-first {
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
      rgba(7, 18, 28, 0.36) 0%,
      rgba(7, 18, 28, 0.28) 28%,
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

  .story-deck.is-reduced .story-foreground {
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

  .story-deck.is-reduced .story-act {
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

  .scroll-whisper,
  .continue-cue {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 4px 0 0;
    padding: 4px 0;
    border: 0;
    background: transparent;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.84);
    will-change: transform;
  }

  .continue-cue {
    cursor: pointer;
  }

  .continue-cue:hover {
    color: #ffffff;
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

  .story-deck.is-reduced .stage-glass-card,
  .story-deck.is-reduced .space-chip,
  .story-deck.is-reduced .story-approval-pill {
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
