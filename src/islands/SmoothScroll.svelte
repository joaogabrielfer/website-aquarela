<script lang="ts">
  import { onMount } from 'svelte';
  import Lenis from 'lenis';

  onMount(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');

    if (reducedMotion.matches || coarsePointer.matches) return;

    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      duration: 1.1,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      respectReducedMotion: true,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });
    const overlays: string[] = [];
    document.documentElement.dataset.smoothScroll = 'active';
    document.documentElement.dataset.smoothScrollState = 'active';

    const overlayChange = ((
      event: CustomEvent<{ type: string; open: boolean }>,
    ) => {
      const type = event.detail?.type;
      if (!type) return;
      if (event.detail.open) {
        if (!overlays.includes(type)) overlays.push(type);
      } else {
        const index = overlays.indexOf(type);
        if (index >= 0) overlays.splice(index, 1);
      }
      if (overlays.length > 0) {
        lenis.stop();
        document.documentElement.dataset.smoothScrollState = 'stopped';
      } else {
        lenis.start();
        document.documentElement.dataset.smoothScrollState = 'active';
      }
    }) as EventListener;

    window.addEventListener('aquarela:overlay-change', overlayChange);

    return () => {
      window.removeEventListener('aquarela:overlay-change', overlayChange);
      lenis.destroy();
      delete document.documentElement.dataset.smoothScroll;
      delete document.documentElement.dataset.smoothScrollState;
    };
  });
</script>
