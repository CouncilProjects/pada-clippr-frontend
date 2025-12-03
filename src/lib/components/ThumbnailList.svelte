<script lang="ts">
	import ListingThumbnailCard from "$lib/components/Listing-ThumbnailCard.svelte";
    import { Slider } from '@skeletonlabs/skeleton-svelte';

    import {md} from "$lib/universalReactivity/screenSizes";
	import { onDestroy } from "svelte";

    const preference = localStorage.getItem('user-preference-display-size');

    let col_size = $state(Number.parseInt(preference || '3'));

    type compProps=ItemThumbnail[]
    
    	import type { ClassValue } from 'svelte/elements';
	import type { ItemThumbnail } from "./types";

	const props: { class?: ClassValue,items:compProps } = $props();

    //when the list is not shown anymore save the preference.
    onDestroy(()=>{
        localStorage.setItem('user-preference-display-size',col_size.toString());
    })
</script>


<!--
@component
ThumbnailList component.

- `items` should be of type **ItemThumbnail[]**
- Go to `ItemThumbnail` at `src/lib/components/types.ts` to see the full shape.
- Usage:
  ```svelte
  <ThumbnailList items={items}/>
-->

<div class={["items-center flex flex-col",props.class]}>
    {#if md.current}
        <Slider value={[col_size]} onValueChange={(e)=>{col_size=e.value[0]}} min={3} max={7} step={1} class="max-w-[10%]">
            <Slider.Label>Items per row</Slider.Label>
            <Slider.Control>
                <Slider.Track>
                    <Slider.Range />
                </Slider.Track>
                <Slider.Thumb class="cursor-pointer" index={0}>
                    <Slider.HiddenInput />
                </Slider.Thumb>
            </Slider.Control>
            <Slider.MarkerGroup>
                {#each [3,4,5,6,7] as elem}
                    <Slider.Marker class="cursor-pointer" value={elem} />
                {/each}
            </Slider.MarkerGroup>
        </Slider>
    {/if}

    <!-- Because tailwind is static we cannot use state directly inside, so we make use of css variables and the repeat-->
    <div class="p-3 m-3 gap-2 grid grid-cols-1 md:grid-cols-[repeat(var(--cols),1fr)] relative place-content-between" style={`--cols: ${col_size};`}>
        {#if !props.items || props.items.length==0}
            <p>No items found.</p>
        {:else}
            {#each props.items as singleItem}
                <ListingThumbnailCard {...singleItem}></ListingThumbnailCard>
            {/each}
        {/if}
        
    </div>

     
</div>
