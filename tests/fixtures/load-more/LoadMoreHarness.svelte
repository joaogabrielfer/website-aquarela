<script lang="ts">
  import LoadMore from '../../../src/islands/LoadMore.svelte';

  const items = [
    'Item sintético 1',
    'Item sintético 2',
    'Item sintético 3',
    'Item sintético 4',
    'Item sintético 5',
  ];
</script>

<LoadMore {items} initialCount={2} batchSize={2} let:items={visibleItems}>
  <ul aria-label="Itens sintéticos">
    {#each visibleItems as item (item)}
      <li>{item}</li>
    {/each}
  </ul>
</LoadMore>
