<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageProps } from './$types';

  const {data}:PageProps=$props();

  function createNew() {
      goto('/my-clippings/create/');
  }
</script>

<h1>My Clippings</h1>

<button on:click={createNew} class="btn btn-primary">+ Create New</button>

{#if data.items?.length > 0}
  <ul>
    {#each data.items as item}
      <li>{item.title} - ${item.price}</li>
    {/each}
  </ul>
{:else}
  <p>No items.</p>
{/if}
