<script lang="ts">
    import ThumbnailList from '$lib/components/ThumbnailList.svelte';
    import { onMount } from 'svelte';
  import type { PageProps } from './$types';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import { goto } from '$app/navigation';

  let { data }:PageProps = $props();

  onMount(()=>{
    if(loggedUser.accountType == "SELLER"){
        goto("/my-clippings")
    }

    if (loggedUser.accountType == "ADMIN") {
        goto("/analytics")
    }
  })
  
</script>

<ThumbnailList items={data.feed || []}></ThumbnailList>