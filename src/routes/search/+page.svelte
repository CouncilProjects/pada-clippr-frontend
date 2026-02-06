<script lang="ts">
    import { page } from '$app/state'
    import SearchResults from '$lib/components/SearchResults.svelte';

    let searchComponent: SearchResults
    $effect(() => {
        const query = page.url.searchParams.get("q")
        if(query === null) return;
        const user = page.url.searchParams.get("u")
        const exp = JSON.parse(page.url.searchParams.get('e') || 'false');
        searchComponent.doSearch(query, user,exp)
    })
</script>

<SearchResults bind:this={searchComponent} />
