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

  const portraitSrcset = $derived(
    portraitUrl?.match(/^\/media\/approvals\/[a-z-]+-800\.webp$/)
      ? `${portraitUrl.replace('-800.webp', '-400.webp')} 400w, ${portraitUrl} 800w`
      : undefined,
  );
</script>

<details class={`approval-card ${className}`} class:has-portrait={portraitUrl}>
  <summary>
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
      <h3 class="card-title">{displayName}</h3>
      {#if achievements.length > 1}
        <span class="approval-count">{achievements.length} aprovações</span>
      {/if}
      <ul class="course-summary">
        {#each achievements as achievement (achievement.id)}
          <li>{achievement.course}</li>
        {/each}
      </ul>
      <span class="details-control">
        <span class="when-closed">Ver detalhes</span>
        <span class="when-open">Fechar detalhes</span>
        <svg
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
      </span>
    </div>
  </summary>
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
</details>

<style>
  .approval-card {
    min-width: 0;
    align-self: start;
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    overflow: hidden;
  }
  summary {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-4);
    cursor: pointer;
    list-style: none;
    color: var(--brand-navy);
    min-height: 48px;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  .has-portrait > summary {
    grid-template-columns: 80px minmax(0, 1fr);
  }
  summary:hover {
    background: var(--surface-paper);
  }
  summary:focus-visible {
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
    min-height: 44px;
    font-weight: 500;
    text-decoration: underline;
  }
  .when-open {
    display: none;
  }
  [open] .when-closed,
  [open] .card-avatar {
    display: none;
  }
  [open] .when-open {
    display: inline;
  }
  .has-portrait[open] > summary {
    grid-template-columns: minmax(0, 1fr);
  }
  [open] .details-control svg {
    transform: rotate(180deg);
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
