<!--
  ApprovalGroupIsland — ilha fina para aprovações por ano.
  LoadMore por ano; grupos NÃO resetam ao carregar outro grupo (R02).
-->
<script lang="ts">
  import LoadMore from './LoadMore.svelte';

  interface Approval {
    id: string;
    displayName: string;
    course: string;
    institution: string;
    selectionProcess: string;
    year: number;
    portraitUrl?: string | null;
    portraitAlt?: string;
  }

  let {
    approvals = [],
    initialCount = 12,
    batchSize = 12,
  }: {
    approvals: Approval[];
    initialCount?: number;
    batchSize?: number;
  } = $props();
</script>

<LoadMore
  items={approvals}
  {initialCount}
  {batchSize}
  buttonLabel="Carregar mais aprovações"
  let:items
>
  <div class="approval-grid">
    {#each items as approval (approval.id)}
      <div class="approval-card">
        {#if approval.portraitUrl}
          <div class="card-media">
            <img
              src={approval.portraitUrl}
              alt={approval.portraitAlt || approval.displayName}
              width="320"
              height="400"
              loading="lazy"
            />
          </div>
        {/if}
        <div class="card-body">
          <h3 class="card-title">{approval.displayName}</h3>
          <p class="card-detail"><strong>Curso:</strong> {approval.course}</p>
          <p class="card-detail">
            <strong>Instituição:</strong>
            {approval.institution}
          </p>
          <p class="card-detail">
            <strong>Processo:</strong>
            {approval.selectionProcess}
          </p>
          <p class="card-detail"><strong>Ano:</strong> {approval.year}</p>
        </div>
      </div>
    {/each}
  </div>
</LoadMore>

<style>
  .approval-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  .approval-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    overflow: hidden;
  }
  .card-media {
    overflow: hidden;
  }
  .card-media img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    aspect-ratio: 4/5;
  }
  .card-body {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .card-title {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.2;
  }
  .card-detail {
    margin: 0;
    color: var(--text-ink);
  }
  @media (min-width: 768px) {
    .approval-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1100px) {
    .approval-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 767px) {
    .card-body {
      padding: var(--space-5);
    }
  }
</style>
