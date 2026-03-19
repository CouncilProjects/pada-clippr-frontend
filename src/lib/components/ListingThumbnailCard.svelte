<script lang="ts">
    import { goto } from '$app/navigation';
    import { RatingGroup } from '@skeletonlabs/skeleton-svelte';
    import { md } from '$lib/universalReactivity/screenSizes';
    import getEventBus from '$lib/universalReactivity/eventBus';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import { verifiedTextGradient } from '$lib/assets/globalColors';

    import type { paths } from '$lib/api-types';

    const fallback =
        'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

    type Item =
        paths['/api/item/']['get']['responses']['200']['content']['application/json']['results'][number];

    let { item, downsized }: { item: Item; downsized?: number } = $props();

    const eventBus = getEventBus();

    $inspect(item);

    const clickHappned = (item: Item) => {
        if (
            !item.negotiable &&
            item.id &&
            loggedUser.accountType === 'MEMBER'
        ) {
            eventBus.emit('thumb-card-click');
        }
        if (item.id) {
            goto(`/clipping/${item.id}`);
        }
    };
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

{#snippet wideTable()}
    <table class="table text-center mt-auto">
        <tbody>
            <tr>
                <td>
                    <div
                        class={`flex flex-col ${
                            item.seller.is_verified_seller ? verifiedTextGradient + ' font-bold' : ''
                        }`}
                    >
                        <span class='h5'>{item.title} </span>
                        {#if item.seller.is_verified_seller} <span class="text-surface-contrast-light caption-bottom text-xs" >By {item.seller.username}</span> {/if}
                        

                        {#if Number.parseFloat(item.rating) < 0}
                            <span class="text-white font-normal">Unrated</span>
                        {:else}
                            <RatingGroup
                                class={item.seller.is_verified_seller ? 'text-yellow-200' : 'text-white'}
                                value={Number.parseFloat(item.rating)}
                                count={5}
                                allowHalf
                                readOnly
                            >
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
                        {/if}
                    </div>
                </td>
                <td>€ <span>{item.price}</span></td>
            </tr>
            <tr>
                <td>
                    {#if item.negotiable}
                        <span class="text-green-600 dark:text-green-400">Negotiable</span>
                    {:else}
                        <span class="text-red-600 dark:text-red-400">Non negotiable</span>
                    {/if}
                </td>
                <td>
                    <span>
                        {item.stock === -1
                            ? 'Made to order'
                            : item.stock === 0
                            ? 'Out of stock'
                            : `Stock left: ${item.stock}`}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
{/snippet}




{#snippet tallTable()}
    <table class="table text-center mt-auto">
        <tbody>
            <tr>
                <td>
                    <div
                        class={`flex flex-col ${
                            item.seller.is_verified_seller ? verifiedTextGradient + ' font-bold' : ''
                        }`}
                    >
                        <span>{item.title}</span>

                        {#if Number.parseFloat(item.rating) < 0}
                            <span class="text-white font-normal">Unrated</span>
                        {:else}
                            <RatingGroup
                                class={item.seller.is_verified_seller ? 'text-yellow-200' : 'text-white'}
                                value={Number.parseFloat(item.rating)}
                                count={5}
                                allowHalf
                                readOnly
                            >
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
                        {/if}
                    </div>
                </td>
            </tr>
            <tr>
                <td><span>{item.price} €</span></td>
            </tr>
            <tr>
                <td>
                    {#if item.stock === -1}
                        <span>Made to order</span>
                    {:else if item.stock === 0}
                        <span class="text-red-600 dark:text-red-400">Out of stock</span>
                    {:else}
                        <span>Stock left: {item.stock}</span>
                    {/if}
                </td>
            </tr>
            <tr>
                <td>
                    {#if item.negotiable}
                        <span class="text-green-600 dark:text-green-400">Negotiable</span>
                    {:else}
                        <span class="text-red-600 dark:text-red-400">Non negotiable</span>
                    {/if}
                </td>
            </tr>
        </tbody>
    </table>
{/snippet}


<button
    class="m-2 card hover:preset-filled-primary-500 hover:-translate-y-2 md:hover:-translate-y-5
        {item.seller.is_verified_seller
            ? 'bg-[#bdb8ae] dark:bg-[#595350] bg-linear-to-br from-red/10 to-blue/5 shadow-sm hover:shadow'
            : 'preset-filled-surface-300-700'}
        {item.id ? 'cursor-pointer' : 'cursor-auto'}"
    style={`max-width:${downsized || 100}%`}
    onclick={() => clickHappned(item)}
    aria-roledescription="Press to go to page"
    data-test={`${item.title}`}
>
    <div class="flex flex-col items-center p-2 h-full">
        <div class="w-32 h-32 mb-2 overflow-hidden rounded-md">
        <img
            src={item.thumbnail ?? fallback}
            onerror={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallback;
            }}
            alt="Thumbnail"
        />
        </div>

        {#if !md.current}
            {@render tallTable()}
        {:else}
            {@render wideTable()}
        {/if}
    </div>
</button>

