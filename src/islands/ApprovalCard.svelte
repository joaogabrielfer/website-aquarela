<script lang="ts">
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
    {#if achievements.length > 1}
      <p class="approval-count">{achievements.length} aprovações</p>
    {/if}
    <h3 class="card-title">{displayName}</h3>
    <ul class="achievement-list">
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
  .approval-count {
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    background: var(--brand-yellow);
    color: var(--brand-navy);
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
  .achievement-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--space-4);
    margin: var(--space-1) 0 0;
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
    line-height: 1.4;
  }
  .card-facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-6);
    margin: var(--space-1) 0 0;
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
    color: var(--text-ink);
    font-size: 0.875rem;
    line-height: 1.4;
    font-weight: 500;
  }
  @media (max-width: 767px) {
    .card-body {
      padding: var(--space-5);
    }
  }
</style>
