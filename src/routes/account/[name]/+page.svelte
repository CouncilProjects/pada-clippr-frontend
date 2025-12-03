<script lang="ts">
	import ThumbnailList from '$lib/components/ThumbnailList.svelte';
	import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';
	import type { PageProps } from './$types';

	let { data }:PageProps = $props();

    import {
		Facebook,
		Youtube,
		Instagram,
		MessageCircle,
		Twitter,
		Ghost,
		Linkedin,
		Pin,
		AtSign
	} from '@lucide/svelte';

    const socials = {
	email: AtSign,
	facebook: Facebook,
	youTube: Youtube,
	instagram: Instagram,
	whatsApp: MessageCircle,
	x: Twitter,
	snapchat: Ghost,
	linkedIn: Linkedin,
	pinterest: Pin
};

const copyURL = (text:string)=>{
    navigator.clipboard.writeText(text);
}

import {verifiedBgGradient,verifiedTextGradient} from "$lib/assets/globalColors"

const gradient='bg-linear-to-t from-red-600 to-sky-600 bg-clip-text text-transparent';
const bgGradient='bg-linear-to-tr from-red-600 to-sky-600'


</script>


<div class="text-center">
    {#if data.isVer}
        <h3 class="h2 {verifiedTextGradient}">Welcome to {data.paramName}'s Shop</h3>
    {:else}
        <h3 class="h3">Welcome to {data.paramName}'s page</h3>
    {/if}
    <div class="flex flex-row">
        <ThumbnailList class="flex-4" items={data.items}></ThumbnailList>
        {#if data.isVer && data.shopSocials.length>0}
            <div class="grid grid-cols-1 flex-1 max-w-[200px] gap-3 md:gap-6 bg-surface-300-700">
                <span class="{verifiedTextGradient} text-lg font-bold">Shop Socials</span>
                {#each data.shopSocials as social}
                    {@const Icon = socials[social.platform]}
                    <Tooltip positioning={{ placement: 'top' }}>
                        <div class="relative flex flex-col justify-center items-center" >
                            <Tooltip.Trigger>
                            
                                <button class="btn-icon preset-tonal-surface hover:{verifiedBgGradient}" onclick={()=>{copyURL(social.url)}}>
                                
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
        {/if}
    </div>
    
</div>