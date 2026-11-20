<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const root = document.documentElement;
    const reducedMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let manualReduced = false;
    try {
      manualReduced =
        window.sessionStorage.getItem('aquarela-motion') === 'reduced';
    } catch {
      manualReduced = false;
    }

    const isReduced = () => reducedMedia.matches || manualReduced;

    const applyMotionState = () => {
      if (manualReduced) root.dataset.motion = 'reduced';
      else delete root.dataset.motion;

      document
        .querySelectorAll<HTMLButtonElement>('[data-motion-toggle]')
        .forEach((btn) => {
          btn.setAttribute('aria-pressed', String(manualReduced));
          const label = btn.querySelector('[data-motion-label]');
          if (label) {
            label.textContent = manualReduced
              ? 'Ativar movimento'
              : 'Reduzir movimento';
          }
        });
    };

    applyMotionState();

    // 1. Progressive scroll reveals (never hides content if reduced motion)
    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    let revealObserver: IntersectionObserver | null = null;

    if (
      !isReduced() &&
      revealEls.length > 0 &&
      'IntersectionObserver' in window
    ) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver?.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.06, rootMargin: '0px 0px -2% 0px' },
      );

      for (const el of revealEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.98) {
          el.classList.add('is-visible');
        } else {
          revealObserver.observe(el);
        }
      }
      root.dataset.revealReady = 'true';
    } else {
      for (const el of revealEls) el.classList.add('is-visible');
    }

    // 2. Subtle interlude parallax
    const interludes = Array.from(
      document.querySelectorAll<HTMLElement>('.editorial-interlude'),
    );

    let scrollRaf = 0;
    const updateScroll = () => {
      scrollRaf = 0;
      if (!isReduced() && interludes.length > 0) {
        const vh = window.innerHeight;
        for (const el of interludes) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) continue;
          const ratio = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
          const offset = Math.max(-28, Math.min(28, ratio * -36));
          el.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
        }
      } else {
        for (const el of interludes) {
          el.style.setProperty('--parallax-y', '0px');
        }
      }
    };

    const scheduleScroll = () => {
      if (!scrollRaf) scrollRaf = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll, { passive: true });
    updateScroll();

    // 3. Pointer-reactive tilt & magnetic arrows (desktop fine pointer only)
    let pointerController: AbortController | null = null;
    const resetCallbacks: Array<() => void> = [];

    const setupPointer = () => {
      pointerController?.abort();
      resetCallbacks.splice(0).forEach((fn) => fn());
      if (!finePointer.matches || isReduced()) return;

      pointerController = new AbortController();
      const { signal } = pointerController;
      const surfaces =
        document.querySelectorAll<HTMLElement>('.editorial-surface');
      const actions =
        document.querySelectorAll<HTMLElement>('.editorial-action');

      const bind = (el: HTMLElement, isSurface: boolean) => {
        let frame = 0;
        let lastPoint: { x: number; y: number } | null = null;

        const reset = () => {
          if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
          }
          lastPoint = null;
          el.classList.remove('is-tracking');
          for (const prop of [
            '--tilt-x',
            '--tilt-y',
            '--magnet-x',
            '--magnet-y',
          ]) {
            el.style.removeProperty(prop);
          }
        };

        const paint = () => {
          frame = 0;
          if (!lastPoint) return;
          const rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const nx = Math.max(
            0,
            Math.min(1, (lastPoint.x - rect.left) / rect.width),
          );
          const ny = Math.max(
            0,
            Math.min(1, (lastPoint.y - rect.top) / rect.height),
          );
          if (isSurface) {
            el.style.setProperty(
              '--tilt-x',
              `${((0.5 - ny) * 2.6).toFixed(2)}deg`,
            );
            el.style.setProperty(
              '--tilt-y',
              `${((nx - 0.5) * 2.6).toFixed(2)}deg`,
            );
          } else {
            el.style.setProperty(
              '--magnet-x',
              `${((nx - 0.5) * 6).toFixed(1)}px`,
            );
            el.style.setProperty(
              '--magnet-y',
              `${((ny - 0.5) * 4).toFixed(1)}px`,
            );
          }
        };

        el.addEventListener(
          'pointerenter',
          () => {
            el.classList.add('is-tracking');
          },
          { signal },
        );
        el.addEventListener(
          'pointermove',
          (ev) => {
            lastPoint = { x: ev.clientX, y: ev.clientY };
            if (!frame) frame = requestAnimationFrame(paint);
          },
          { signal, passive: true },
        );
        el.addEventListener('pointerleave', reset, { signal });
        resetCallbacks.push(reset);
      };

      surfaces.forEach((el) => bind(el, true));
      actions.forEach((el) => bind(el, false));
    };

    setupPointer();

    // 4. Motion toggle clicks
    const toggleButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]'),
    );
    const onToggleMotion = () => {
      manualReduced = !manualReduced;
      try {
        window.sessionStorage.setItem(
          'aquarela-motion',
          manualReduced ? 'reduced' : 'full',
        );
      } catch {
        // Ignore storage errors in restricted contexts
      }
      applyMotionState();
      if (manualReduced) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
      }
      setupPointer();
      updateScroll();
    };
    toggleButtons.forEach((btn) =>
      btn.addEventListener('click', onToggleMotion),
    );

    const onMediaChange = () => {
      setupPointer();
      updateScroll();
    };
    reducedMedia.addEventListener('change', onMediaChange);
    finePointer.addEventListener('change', onMediaChange);

    return () => {
      revealObserver?.disconnect();
      pointerController?.abort();
      resetCallbacks.forEach((fn) => fn());
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', scheduleScroll);
      toggleButtons.forEach((btn) =>
        btn.removeEventListener('click', onToggleMotion),
      );
      reducedMedia.removeEventListener('change', onMediaChange);
      finePointer.removeEventListener('change', onMediaChange);
    };
  });
</script>
