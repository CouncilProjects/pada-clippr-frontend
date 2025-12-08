
<script lang="ts">
	import { goto } from "$app/navigation";
    const fallback = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
    import {verifiedTextGradient} from "$lib/assets/globalColors"
    let {title,price,neg,stock,thumbnail=fallback,downsized,fromVerified,clipId}:ItemThumbnail = $props()
    
    import {md} from "$lib/universalReactivity/screenSizes"
	import type { ItemThumbnail } from "./types";

    import getEventBus from "$lib/universalReactivity/eventBus";
    const eventBus = getEventBus();
    
    const clickHappned=(ver:boolean,clipId?:string)=>{
        if(!ver && clipId){
            eventBus.emit('thumb-card-click');
        }
        if(clipId){
            goto(`/clipping/${clipId}`)
        }
    }
</script>


<!--
@component
ThumbnailList component.

-The thumbnail card takes the arguments of `ItemThumbnail` typed in /lib/components/types
- Props `thumbnail`, `downsized` and `fromVerified` are optional, the card works without them.
- Usage:
  ```svelte
  <ListingThumbnailCard {title} {price} {neg} {stock} />
-->


{#snippet wideTable(title:string,price:number,neg:boolean,stock:number)}
    <table class="table text-center mt-auto ">
            <tbody>
                <tr>
                    <td>
                        <span class="{fromVerified?verifiedTextGradient+' font-bold':''}">{title}</span>
                    </td>
                    <td>
                        € <span>{price}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        {#if neg}
                            <span class="text-green-600 dark:text-green-400">Negotiable</span>
                        {:else}
                            <span class="text-red-600 dark:text-red-400">Non negotiable</span>
                        {/if}
                    </td>
                    <td>
                        <span>Stock left: {stock}</span>
                    </td>
                </tr>
            </tbody>
        </table>
{/snippet}

{#snippet tallTable(title:string,price:number,neg:boolean,stock:number)}
    <table class="table text-center mt-auto ">
            <tbody>
                <tr>
                    <td>
                        <span class="{fromVerified?verifiedTextGradient+' font-bold':''}">{title}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>{price} $</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>Stock left: {stock}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        {#if neg}
                            <span class="text-green-600 dark:text-green-400">Negotiable</span>
                        {:else}
                            <span class="text-red-600 dark:text-red-400">Non negotiable</span>
                        {/if}
                    </td>
                </tr>
            </tbody>
        </table>
{/snippet}
<button class="{clipId?'cursor-pointer':'cursor-auto'} m-2 card 
    { fromVerified?
        'bg-[#bdb8ae] dark:bg-[#595350] bg-linear-to-br from-red/10 to-blue/5 shadow-sm hover:shadow' 
        :'preset-filled-surface-300-700'} 
        hover:preset-filled-primary-500 hover:-translate-y-2 md:hover:-translate-y-5 " 
        style={`max-width:${downsized || 100}%`}
        onclick={()=>{clickHappned(neg,clipId)}}
        aria-roledescription="Press to go to page"
        >
    
    <div class="flex flex-col items-center p-2 h-full">
        <img src={thumbnail} onerror={(e)=>{(e.currentTarget as HTMLImageElement).src=fallback}} alt="Thumbnail"/>
        {#if !md.current} <!--If smaller than md-->
            {@render tallTable(title,price,neg,stock)}
        {:else }
            {@render wideTable(title,price,neg,stock)}
        {/if}
        
    </div>
</button>