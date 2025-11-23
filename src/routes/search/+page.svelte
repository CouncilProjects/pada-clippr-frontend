<script lang="ts">
    import { page } from '$app/state'
    import apiCaller from "$lib/axiosConfig"

    interface Item {
        title: string
    }

    let searchResults =  $state<Item[]>([])

    async function doSearch() {
        const query = page.url.searchParams.get("q");
        if(query === null) return;

        const result = await apiCaller.get("/item/", { params: {
            q: encodeURIComponent(query)
        }})

        searchResults = result.data.results
    }

     $effect(() => { doSearch() })
</script>

<div>
    {#each searchResults as item}
        <div>{item.title}</div>
    {/each}
</div>
