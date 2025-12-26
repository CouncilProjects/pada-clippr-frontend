<script lang="ts">
  import { goto } from '$app/navigation';
  import ListingThumbnailCard from '$lib/components/ListingThumbnailCard.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  function createNew() {
    goto('/my-clippings/create/');
  }
</script>

<h1>My Clippings</h1>
<button onclick={createNew} class="btn btn-primary mb-4">+ Create New</button>

{#if data.items?.length > 0}
  <div class="flex flex-wrap gap-4">
    {#each data.items as item, i (item.clipId ?? i)}
      <ListingThumbnailCard 
        title={item.title}
        price={item.price}
        neg={item.neg}
        stock={item.stock}
        rating={item.rating}
        thumbnail={item.thumbnail}
        downsized={item.downsized}
        fromVerified={item.fromVerified}
        clipId={item.clipId}
      />
    {/each}
  </div>
{:else}
  <p>No items found.</p>
{/if}
