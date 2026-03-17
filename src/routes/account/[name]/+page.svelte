<script lang="ts">
	import SearchResults from '$lib/components/SearchResults.svelte';
	import { Accordion, Portal, Progress, RatingGroup, Tooltip } from '@skeletonlabs/skeleton-svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
    type accountReviewType = paths['/api/review/account/{username}/']['get']['responses']['200']['content']['application/json'][number]
    let searchComponent: SearchResults

    import {
		Facebook,
		Youtube,
		Instagram,
		MessageCircle,
		Twitter,
		Ghost,
		Linkedin,
		Pin,
		AtSign,

		ChevronDownIcon

	} from '@lucide/svelte';

    const socials = {
	email: AtSign,
	facebook: Facebook,
	youtube: Youtube,
	instagram: Instagram,
	whatsapp: MessageCircle,
	twitter: Twitter,
	snapchat: Ghost,
	linkedin: Linkedin,
	pinterest: Pin
};

const copyURL = (text:string)=>{
    navigator.clipboard.writeText(text);
}

import {verifiedBgGradient,verifiedBgGradientHover,verifiedTextGradient} from "$lib/assets/globalColors"
import { type ItemThumbnail } from '$lib/components/types';
import { md } from '$lib/universalReactivity/screenSizes'; // Note the screen sizes i made follow Tailwind sizes. Used the same way
	import { onMount } from 'svelte';
    import type { paths } from '$lib/api-types';

onMount(() => searchComponent.doSearch(null, null, data.userID?.toString()||''))

</script>


{#snippet leftReview(review : accountReviewType)}
    <div class="card flex flex-col preset-filled-surface-600-400 p-3 m-2 items-center">
        <span>Posted at: {new Date(review.created_at).toLocaleString()}</span>
        <hr class="hr">
        <RatingGroup  
            class={data.isVer ? 'text-yellow-200' : 'text-white'} 
            count={5}
            value={Number(review.rating)}
            readOnly
            allowHalf={true}>
            <RatingGroup.Control>
                <RatingGroup.Context>
                    {#snippet children(ratingGroup)}
                        {#each ratingGroup().items as index (index)}
                            <RatingGroup.Item {index} />
                        {/each}
                    {/snippet}
                </RatingGroup.Context>
            </RatingGroup.Control>
            <RatingGroup.HiddenInput />
        </RatingGroup>
        {#if review.comment!=null}
            <span>A User said:</span>
            <p class="card preset-filled-surface-700-300 p-2">{review.comment}</p>
        {:else}
            <span>No comment</span>
        {/if}
    </div>
{/snippet}

{#snippet ShowSocials()}
    <Accordion class="card preset-filled-surface-200-800 p-1 m-2 flex-col" collapsible>
    <Accordion.Item value={'1'}>
        <Accordion.ItemTrigger class="flex justify-between items-center">
            <span class="{verifiedTextGradient} text-lg font-bold">Shop Socials</span>
            <Accordion.ItemIndicator class="group">
                <ChevronDownIcon class="h-5 w-5 transition group-data-[state=open]:rotate-180" />
            </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
<div class="grid grid-cols-1 gap-3 md:gap-6" >
                            {#each data.shopSocials as social}
                                {@const Icon = socials[social.platform]} <!-- I need the variable to use it later, Icon holds the cooreponding icon from the dict-->
                                <Tooltip positioning={{ placement: 'top' }}>
                                    <div class="relative flex flex-col justify-center items-center" >
                                        <Tooltip.Trigger>
                                        
                                            <button class="btn-icon preset-tonal-surface {verifiedBgGradientHover}" onclick={()=>{copyURL(social.url as string)}}>
                                            
                                                <Icon size={30} />
                                            </button>
                                            
                                    
                                    </Tooltip.Trigger>
                                    <span class="text-xs">{social.platform.toUpperCase()}</span>
                                    </div>
                                    <Portal>
                                        <Tooltip.Positioner>
                                            <Tooltip.Content class="card p-2 preset-filled-surface-800-200 flex flex-col">
                                                <span>{social.url}</span>
                                                
                                                <span class="text-xs self-end italic text-secondary-200 dark:text-tertiary-900">click to copy</span>
                                                <Tooltip.Arrow class="[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-950-50)]">
                                                    <Tooltip.ArrowTip />
                                                </Tooltip.Arrow>
                                            </Tooltip.Content>
                                        </Tooltip.Positioner>
                                    </Portal>
                                </Tooltip>
                                
                            {/each}
                        </div>
        </Accordion.ItemContent>
    </Accordion.Item>
</Accordion>
{/snippet}

{#snippet ShowReviews()}
    <Accordion class="card preset-filled-surface-200-800 p-1 m-2 flex-col" collapsible>
    <Accordion.Item value={'1'}>
        <Accordion.ItemTrigger class="flex justify-between items-center">
            <span class="text-lg font-bold">Reviews</span>
            <Accordion.ItemIndicator class="group">
                <ChevronDownIcon class="h-5 w-5 transition group-data-[state=open]:rotate-180" />
            </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
            {#await data.reviewsPromise}
                <div class="flex flex-col items-center py-4">
                    <Progress class="items-center w-fit" value={null}>
                        <Progress.Circle>
                            <Progress.CircleTrack />
                            <Progress.CircleRange />
                        </Progress.Circle>
                        <Progress.ValueText />
                    </Progress>
                    <span>Searching for reviews</span>
                </div>
            {:then response}
                <span class="font-medium mb-2">Total reviews: {response?.data.length}</span>
                <div class="flex flex-col overflow-y-auto max-h-96 gap-2">
                    {#each response?.data as entry}
                        {@render leftReview(entry)}
                    {/each}
                </div>
            {:catch error}
                <span class="text-red-500">Failed to load reviews.</span>
            {/await}
        </Accordion.ItemContent>
    </Accordion.Item>
</Accordion>
{/snippet}

<div class="text-center items-center justify-center flex flex-col">
        {#if data.isVer}
            <h3 class="h2 {verifiedTextGradient}">Welcome to {data.paramName}'s Shop</h3>
        {:else}
            <h3 class="h3">Welcome to {data.paramName}'s page</h3>
        {/if}
        {#if !md.current && data.isVer && data.shopSocials.length>0}
        
            {@render ShowSocials()}
            {@render ShowReviews()}
            
        {/if}
        <div class="flex flex-row">
            <SearchResults bind:this={searchComponent} class="mr-3 flex-4" />
            {#if md.current}
                <div class="flex flex-1 flex-col m-4">
                    {#if md.current}
                        {#if data.isVer && data.shopSocials.length>0}
                            {@render ShowSocials()}
                        {/if}
                        {@render ShowReviews()}
                    {/if}
                    
                    
                </div>
            {/if}
            
            {#if md.current && !data.isVer}
                <div class="flex-1 card bg-surface-300-700 max-h-dvh text-2xl text-center" >
                    {@html 'AD<br>SPACE<br>FOR<br>RENT'}
                </div>
            {/if}
        </div>
</div>
