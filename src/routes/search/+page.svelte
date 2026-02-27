<script lang="ts">
    import { page } from '$app/state'
    import SearchResults from '$lib/components/SearchResults.svelte';

    let searchComponent: SearchResults
    $effect(() => {
        const query = page.url.searchParams.get("q")
        const tags = page.url.searchParams.get("t")
        const user = page.url.searchParams.get("u")
        if(query === null && tags === null && user == null) return;
        const exp = JSON.parse(page.url.searchParams.get('e') || 'false');
        searchComponent.doSearch(query, tags, user, exp)
    })
</script>

<SearchResults bind:this={searchComponent} />
