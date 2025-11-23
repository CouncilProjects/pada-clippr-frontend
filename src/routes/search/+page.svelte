<script lang="ts">
    import { page } from '$app/state'
    import apiCaller from "$lib/axiosConfig"
    import { MessageSquareDiff } from '@lucide/svelte';

    interface Item {
        title: string
        price: number
        negotiable: boolean
    }

    let searchResults =  $state<Item[]>([])

    async function doSearch() {
        const query = page.url.searchParams.get("q");
        if(query === null) return;

        const result = await apiCaller.get("/item/", { params: {
            q: encodeURIComponent(query)
        }})

        searchResults = result.data.results
        console.log(searchResults)
    }

     $effect(() => { doSearch() })
</script>

<div class="overflow-x-auto py-5">
    <table class="w-full border-collapse"><tbody class="space-y-2">
        {#each searchResults as item}
            <tr class="bg-surface-100 dark:bg-surface-800 rounded-lg shadow p-4 flex justify-between items-center">
                <td>{item.title}</td>
                <td>€{item.price}</td>
                <td> {#if item.negotiable}
                    <MessageSquareDiff />
                {/if} </td>
            </tr>
        {/each}
    </tbody></table>
</div>
