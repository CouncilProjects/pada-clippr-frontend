<script lang="ts">
	import SearchResults from '$lib/components/SearchResults.svelte';
	import { Accordion, Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
    $inspect(data.shopSocials);
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

onMount(() => searchComponent.doSearch(null, data.userID?.toString()||''))

</script>

{#snippet ShowSocials()}
    <Accordion class="flex-1 max-w-[200px] h-max bg-surface-300-700" collapsible>
                <Accordion.Item value=1>
                    <Accordion.ItemTrigger class="flex justify-between items-center">
                        <span class="{verifiedTextGradient} text-lg font-bold">Shop Socials</span>
                        <Accordion.ItemIndicator class="group">
                        <ChevronDownIcon class="h-5 w-5 transition group-data-[state=open]:rotate-180" />
                    </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                    
                    <Accordion.ItemContent >
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

<div class="text-center items-center justify-center flex flex-col">
    {#if data.isVer}
        <h3 class="h2 {verifiedTextGradient}">Welcome to {data.paramName}'s Shop</h3>
    {:else}
        <h3 class="h3">Welcome to {data.paramName}'s page</h3>
    {/if}
    {#if !md.current && data.isVer && data.shopSocials.length>0}
        {@render ShowSocials()}
    {/if}
    <div class="flex flex-row">
        <SearchResults bind:this={searchComponent} class="mr-3 flex-4" />
        {#if md.current && data.isVer && data.shopSocials.length>0}
           {@render ShowSocials()}
        {/if}
        {#if md.current && !data.isVer}
            <div class=" flex-1 card bg-surface-300-700 h-dvh text-2xl text-center" >
                {@html 'AD<br>SPACE<br>FOR<br>RENT'}
            </div>
        {/if}
    </div>
    
</div>
