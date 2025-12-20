<script lang="ts">
    import apiCaller from "$lib/axiosConfig"
    import { Pagination } from '@skeletonlabs/skeleton-svelte';
    import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
    import type { ClassValue } from 'svelte/elements';

    import type { ItemThumbnail } from '$lib/components/types';
    import ThumbnailList from "$lib/components/ThumbnailList.svelte";

    const props: { class?: ClassValue, klass?: ClassValue } = $props();
    const fallback = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

    let searchResults =  $state<ItemThumbnail[]>([])
    let pageNumber = $state(1)
    let pageSize = $state(10)
    let totalItems = $state(0)

    interface Seller {
        username: string
        is_verified_seller: boolean
    }

    interface ItemBackend {
        id: number
        title: string
        price: number
        rating: number
        stock: number
        negotiable: boolean
        seller: Seller
        thumbnail: string | null
    }

    export async function doSearch(query: string|null, user: string|null) {
        const params: Record<string, any> = {
            q: null, u: null,
            amount: pageSize,
            page: pageNumber
        }

        if(query != null) params.q = encodeURIComponent(query);
        if(user != null)  params.u = encodeURIComponent(user);

        const result = await apiCaller.get("/item/", { params: params })

        searchResults = result.data.results.map(
            (item: ItemBackend, index: number) => { return {
                title: item.title,
                neg: item.negotiable,
                price: item.price,
                stock: item.stock,
                clipId: item.id,
                thumbnail: item.thumbnail || fallback,
                fromVerified: item.seller.is_verified_seller
            }}
        )

        totalItems = result.data.count
    }
</script>

<!--
@component
Component for performing and displaying item search results.
You should bind the component and call its `doSearch(query, userID)`function when an update is needed.
Both `query` and `userID` are of type `string|null` but `userID` must be a positive integer.

```svelte
<script>
let searchComponent: SearchResults

// whenever an update is needed
searchComponent.doSearch(query, userID)
</script>

<SearchResults bind:this={searchComponent} />
```
-->
<div class={["overflow-x-auto", props.class]}>
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

    <ThumbnailList class={props.klass} items={searchResults}/>
</div>
