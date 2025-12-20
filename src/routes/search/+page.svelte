<script lang="ts">
    import { page } from '$app/state'
    import SearchResults from '$lib/components/SearchResults.svelte';

    let searchComponent: SearchResults
    $effect(() => {
        const query = page.url.searchParams.get("q")
        if(query === null) return;
        const user = page.url.searchParams.get("u")
        searchComponent.doSearch(query, user)
    })
</script>

<SearchResults bind:this={searchComponent} />
