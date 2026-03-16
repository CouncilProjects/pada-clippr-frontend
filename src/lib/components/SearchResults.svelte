<script lang="ts">
    import apiCaller from "$lib/axiosConfig"
    import { Pagination } from '@skeletonlabs/skeleton-svelte';
    import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
    import type { ClassValue } from 'svelte/elements';

    import ThumbnailList from "$lib/components/ThumbnailList.svelte";
    import type { paths } from "$lib/api-types";
    import { loggedUser } from "$lib/universalReactivity/auth.svelte";

    const props: { class?: ClassValue, klass?: ClassValue } = $props();
    const fallback = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
    const searchesKeptLimit = 5;

    let searchResults =  $state<ItemBackend['results']>([])
    let pageNumber = $state(1)
    let pageSize = $state(10)
    let totalItems = $state(0)

    type ItemBackend = paths['/api/item/']['get']['responses']['200']['content']['application/json'];

    export async function doSearch(query: string|null, tags: string|null, user: string|null, expand:boolean=false) {
        const params: paths['/api/item/']['get']['parameters']['query'] = {
            amount: pageSize,
            page: pageNumber
        }

        if(query != null) params.q = query;
        if(tags != null)  params.t = tags;
        if(user != null)  params.u = user;
        params.e = expand; //JSON.parse(localStorage.getItem(`clippr-${loggedUser.id}-expand-search`) || 'false');

        const result = await apiCaller.get<ItemBackend>("/item/", { params: params })
        let userIntrests:string[] = JSON.parse(localStorage.getItem(`clippr-${loggedUser.id}-latest-searches`) || '[]');
        if(query!=null){
            if(userIntrests.length==searchesKeptLimit) userIntrests.pop();
            userIntrests = [query].concat(userIntrests);
            localStorage.setItem(`clippr-${loggedUser.id}-latest-searches`,JSON.stringify(userIntrests));
        }

        searchResults = result.data.results.map((item)=>{return {...item,thumbnail:item.thumbnail||fallback}});

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