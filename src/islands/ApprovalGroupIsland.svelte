<!--
  ApprovalGroupIsland — ilha fina para aprovações por ano.
  LoadMore por ano; grupos NÃO resetam ao carregar outro grupo (R02).
-->
<script lang="ts">
  import LoadMore from './LoadMore.svelte';
  import ApprovalCard from './ApprovalCard.svelte';
  import type { ApprovalAchievement } from '../lib/approval-groups';

  interface Approval {
    id: string;
    displayName: string;
    achievements: ApprovalAchievement[];
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

  const year = $derived(approvals[0]?.year);
</script>

<LoadMore
  items={approvals}
  {initialCount}
  {batchSize}
  buttonLabel={year
    ? `Carregar mais aprovações de ${year}`
    : 'Carregar mais aprovações'}
  let:items
>
  <div class="approval-grid">
    {#each items as approval (approval.id)}
      <ApprovalCard {...approval} />
    {/each}
  </div>
</LoadMore>

<style>
  .approval-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  @media (min-width: 768px) {
    .approval-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-5);
    }
  }
  @media (min-width: 1100px) {
    .approval-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--space-6);
    }
  }
</style>
