<script lang="ts">
    import { page } from '$app/state'
    import apiCaller from "$lib/axiosConfig"
    import { MessageSquareDiff } from '@lucide/svelte';
    import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
    import { Pagination } from '@skeletonlabs/skeleton-svelte';

    interface Item {
        title: string
        price: number
        negotiable: boolean
    }

    let searchResults =  $state<Item[]>([])
    let pageNumber = $state(1)
    let pageSize = $state(10)
    let totalItems = $state(0)

    async function doSearch() {
        const query = page.url.searchParams.get("q");
        if(query === null) return;

        const result = await apiCaller.get("/item/", { params: {
            q: encodeURIComponent(query),
            amount: pageSize,
            page: pageNumber
        }})

        searchResults = result.data.results
        totalItems = result.data.count
    }

     $effect(() => { doSearch() })
</script>

<div class="overflow-x-auto py-5">
    <div class="flex justify-between items-center gap-4 w-full">
        <label class="label">
            <span class="sr-only">Page Size</span>
            <select class="select w-fit" value={String(pageSize)} onchange={(e) => (pageSize = Number(e.currentTarget.value))}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </label>
        <Pagination count={totalItems} {pageSize} page={pageNumber} onPageChange={(event) => (pageNumber = event.page)}>
            <Pagination.PrevTrigger>
                <ArrowLeftIcon class="size-4" />
            </Pagination.PrevTrigger>
            <Pagination.Context>
                {#snippet children(pagination)}
                    {#each pagination().pages as page, index (page)}
                        {#if page.type === 'page'}
                            <Pagination.Item {...page}>
                                {page.value}
                            </Pagination.Item>
                        {:else}
                            <Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
                        {/if}
                    {/each}
                {/snippet}
            </Pagination.Context>
            <Pagination.NextTrigger>
                <ArrowRightIcon class="size-4" />
            </Pagination.NextTrigger>
        </Pagination>
    </div>
    <table class="table w-full border-collapse">
        <thead>
            <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Negotiable</th>
            </tr>
        </thead>
        <tbody class="space-y-2">
            {#each searchResults as item}
                <tr>
                    <td>{item.title}</td>
                    <td>€{item.price}</td>
                    <td> {#if item.negotiable}
                        <MessageSquareDiff />
                    {/if} </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
