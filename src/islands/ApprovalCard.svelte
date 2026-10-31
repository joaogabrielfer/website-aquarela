<script lang="ts">
  let {
    displayName,
    course,
    institution,
    selectionProcess,
    year,
    portraitUrl = null,
    portraitAlt,
    class: className = '',
  }: {
    displayName: string;
    course: string;
    institution: string;
    selectionProcess: string;
    year: number;
    portraitUrl?: string | null;
    portraitAlt?: string | undefined;
    class?: string;
  } = $props();

  // Somente os retratos controlados deste lote têm variantes 400/800.
  const portraitSrcset = $derived(
    portraitUrl?.match(/^\/media\/approvals\/[a-z-]+-800\.webp$/)
      ? `${portraitUrl.replace('-800.webp', '-400.webp')} 400w, ${portraitUrl} 800w`
      : undefined,
  );
</script>

<article class={`approval-card ${className}`}>
  {#if portraitUrl}
    <div class="card-media">
      <img
        src={portraitUrl}
        srcset={portraitSrcset}
        sizes="(min-width: 1392px) 416px, (min-width: 1100px) calc((100vw - 144px) / 3), (min-width: 768px) calc((100vw - 84px) / 2), calc(100vw - 40px)"
        alt={portraitAlt || displayName}
        width="800"
        height="1000"
        loading="lazy"
        decoding="async"
      />
    </div>
  {/if}
  <div class="card-body">
    <p class="card-institution">{institution}</p>
    <h3 class="card-title">{displayName}</h3>
    <p class="card-course">{course}</p>
    <dl class="card-facts">
      <div>
        <dt>Processo</dt>
        <dd>{selectionProcess}</dd>
      </div>
      <div>
        <dt>Ano</dt>
        <dd>{year}</dd>
      </div>
    </dl>
  </div>
</article>

<style>
  .approval-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    overflow: hidden;
  }
  .card-media {
    aspect-ratio: 4 / 5;
    background: var(--surface-paper);
    border-bottom: 4px solid var(--brand-yellow);
  }
  .card-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;
  }
  .card-body {
    padding: var(--space-6);
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  .card-institution {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.4;
    font-weight: 500;
  }
  .card-title {
    margin: 0;
    color: var(--brand-navy);
    font-size: 1.5rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }
  .card-course {
    margin: 0 0 var(--space-3);
    color: var(--text-ink);
  }
  .card-facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4) var(--space-6);
    width: 100%;
    margin: auto 0 0;
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-subtle);
  }
  .card-facts div {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  dt {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.4;
  }
  dd {
    margin: 0;
    color: var(--brand-navy);
    font-size: 1rem;
    font-weight: 500;
  }
  @media (max-width: 767px) {
    .card-body {
      padding: var(--space-5);
    }
  }
</style>
