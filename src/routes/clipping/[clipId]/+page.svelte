<script lang="ts">
    import { goto } from '$app/navigation';
    import { type PageProps } from './$types';
    import { page } from '$app/state';
    import apiCaller from '$lib/axiosConfig';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import { CircleChevronUp } from '@lucide/svelte';
    import { Progress, RatingGroup } from '@skeletonlabs/skeleton-svelte';
    import type { paths } from '$lib/api-types';

    //why have a loader function if you dont use it ?
    let { data:loaderData }:PageProps = $props()

    type itemReviewType = paths['/api/review/item/{item_id}/']['get']['responses']['200']['content']['application/json'][number]
    
    

    const fallback =
        'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

    interface ImageEntry {
        id: number;
        image: string;
        order: number;
    }

    interface Seller {
        id: number;
        username: string;
        is_verified_seller: boolean;
    }

    interface Clipping {
        id: number;
        title: string;
        price: number;
        rating?: number;
        stock: number;
        negotiable: boolean;
        description?: string;
        thumbnail?: string | null;
        images?: ImageEntry[];
        ownerId?: number | null;
        seller?: Seller | null;
    }

    let clipping = $state<Clipping | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    const currentUserId = $derived.by(() => loggedUser.id);
    let activeImage = $state<string | null>(null);
    let showModal = $state(false);
    let message = $state('');
    let offer = $state('');
    let errorMsg = $state('');
    let quantiny = $state('');
    

    const allImages = $derived.by(() => {
        if (!clipping) return [];

        if (Array.isArray(clipping.images) && clipping.images.length > 0) {
            return [...clipping.images]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((entry) => entry.image)
                .filter(Boolean) as string[];
        } else if (clipping.thumbnail) {
            return [clipping.thumbnail];
        }

        return [];
    });

    const displayImage = $derived.by(
        () => activeImage ?? allImages[0] ?? fallback
    );

    const isOwner = $derived.by(() => {
        if (!clipping || currentUserId == null) return false;

        // Prefer explicit ownerId when available
        if (clipping.ownerId != null) {
            return clipping.ownerId === currentUserId;
        }

        // Fallback to seller ID if ownerId is not provided
        return clipping.seller?.id === currentUserId;
    });

    const ratingDisplay = $derived.by(() => {
        if (clipping?.rating == null) return null;

        const r = Number(clipping.rating);
        if (isNaN(r) || r < 0) return null;

        return r.toFixed(1);
    });

    //?? the fuck is this ?
    $effect(() => {
        const clipId = page.params.clipId;
        if (!clipId) return;

        const fetchClipping = async () => {
            loading = true;
            error = null;

            try {
                const res = await apiCaller.get(`/item/${clipId}/`);

                clipping = {
                    ...res.data,
                    price: Number(res.data.price),
                    rating:
                        res.data.rating != null
                            ? Number(res.data.rating)
                            : undefined,
                    stock: Number(res.data.stock),
                    // API seems to return seller as nested object (Django FK), not ownerId directly
                    ownerId: res.data.seller?.id ?? null,
                    images: Array.isArray(res.data.images)
                        ? res.data.images
                        : []
                };

                activeImage = null;

                console.log('Clipping loaded', {
                    clipId,
                    ownerId: clipping ? clipping.ownerId : null,
                    seller: clipping ? clipping.seller : null,
                    currentUserId: loggedUser.id,
                    isOwner: clipping ? clipping.ownerId === loggedUser.id : false,
                    clipping
                });
            } catch (err) {
                error = 'Failed to load listing.';
                console.error('Failed to fetch clipping', err);
            } finally {
                loading = false;
            }
        };

        fetchClipping();
    });

    const goBack = () => {
        history.length > 1
            ? history.back()
            : (window.location.href = '/');
    };

    const handleBuy = () => {
        // Treat -1 as "Made to order" (infinite/always available) so we still allow interest.
        if (!clipping || (clipping.stock !== -1 && clipping.stock <= 0)) return;
        showModal = true;
        console.log('Buy clicked', clipping.id);
    };

    const handleEdit = () => {
        if (!clipping) return;
        goto(`/clipping/${clipping.id}/edit`,{replaceState:true});
    };

    const handleDelete = async () => {
        if (!clipping) return;

        if (!confirm('Delete this listing?')) return;

        console.log('Delete clicked', clipping.id);
    };

    const sendRequest = async () => {
    if (!clipping) return;

    // Basic client-side validation to avoid sending invalid payloads.
    const messageText = message == null ? '' : String(message).trim();
    if (!messageText) {
        errorMsg = 'Please enter a message before sending your request.';
        return;
    }

    const offerText = offer == null ? '' : String(offer).trim();
    const offerNumber = clipping.negotiable
        ? offerText
            ? Number(offerText)
            : null
        : null;

    if (clipping.negotiable && offerNumber != null && Number.isNaN(offerNumber)) {
        errorMsg = 'Please enter a valid offer amount.';
        return;
    }

    const quantity = quantiny ? Number(quantiny) : 1;

    if (Number.isNaN(quantity) || quantity < 1) {
        errorMsg = 'Please enter a valid quantity.';
        return;
    }

    // Treat -1 as "Made to order" (no stock limit)
    if (clipping.stock != null && clipping.stock !== -1 && quantity > clipping.stock) {
        errorMsg = `Quantity cannot exceed available stock (${clipping.stock}).`;
        return;
    }

    const body = {
        item: clipping.id,
        item_id: clipping.id,
        message: message.trim(),
        offer_price: offerNumber,
        quantity
    };

    try {
        await apiCaller.post('/pendingrequests/create/', body);

        showModal = false;
        message = '';
        offer = '';
        errorMsg = '';
    } catch (e: any) {
        console.error('Pending request failed', e);

        const data = e?.response?.data;
        if (data) {
            // Prefer a user-friendly message but fall back to raw JSON if needed.
            errorMsg =
                data.detail ||
                (typeof data === 'string' ? data : JSON.stringify(data));
        } else {
            errorMsg = 'Failed to create request (server error).';
        }
    }
};

</script>

{#snippet leftReview(review : itemReviewType)}
    <div class="card flex flex-col preset-filled-surface-600-400 p-3 m-2 items-center">
        <span>Posted at: {new Date(review.created_at).toLocaleString()}</span>
        <hr class="hr">
        <RatingGroup  
            class={loaderData.clipping.seller.is_verified_seller ? 'text-yellow-200' : 'text-white'} 
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

<div class="max-h-dvh box-border p-8 bg-surface-50-950 text-surface-900-100 flex-col md:flex-row flex">
    <div class=" md:w-1/4 card preset-filled-surface-200-800 p-1 m-1 items-center">
        {#await loaderData.reviewPromice}
            <div>
                <Progress class="items-center w-fit" value={null}>
                    <Progress.Circle>
                        <Progress.CircleTrack />
                        <Progress.CircleRange />
                    </Progress.Circle>
                    <Progress.ValueText />
                </Progress>
            <span>Searching for reviews</span>
            </div>
        {:then {data} } <!--This destructures the axios response--> 
            <span>Total reviews {data.length}</span>
            <div class="flex flex-col overflow-y-auto">
                {#each data as entry}
                    {@render leftReview(entry)}
                {/each}
            </div>
        {/await}
    </div>

    <div class=" md:w-3/4 max-w-6xl mx-auto">

        <button class="btn preset-tonal-surface mb-6" onclick={() => history.back()}>
            ← Back
        </button>

        {#if loading}
            <div class="flex flex-col items-center gap-3 py-20">
                <div class="spinner"></div>
                <span>Loading listing…</span>
            </div>

        {:else if error}
            <div class="text-center py-20 text-error-500">
                ⚠ {error}
            </div>

        {:else if clipping}

            <div class="grid md:grid-cols-2 gap-10">

                <div class="flex flex-col gap-4">

                    <div class="rounded-xl overflow-hidden bg-surface-200-800 aspect-[4/3]">
                        <img
                            src={displayImage}
                            alt={clipping.title}
                            class="w-full h-full object-cover transition-transform hover:scale-105"
                            onerror={(e) =>
                                ((e.currentTarget as HTMLImageElement).src = fallback)}
                        />
                    </div>

                    {#if allImages.length > 0}
                        <div class="flex gap-3 justify-center flex-wrap">

                            {#each allImages as img, i (img)}

                                <button
                                    class="w-16 h-16 rounded-lg overflow-hidden border-2 transition-transform"
                                    class:border-primary-500={displayImage === img}
                                    class:scale-110={displayImage === img}
                                    onclick={() => (activeImage = img)}
                                    type="button"
                                >
                                    <img
                                        src={img}
                                        alt="thumbnail"
                                        class="w-full h-full object-cover"
                                        loading="lazy"
                                        onerror={(e) =>
                                            ((e.currentTarget as HTMLImageElement).src = fallback)}
                                    />
                                </button>

                            {/each}

                        </div>
                    {/if}

                </div>

                <!-- Info -->
                <div class="flex flex-col gap-6">

                    {#if clipping.seller}
                        <div>
                            <div class="text-sm uppercase tracking-wider text-surface-500 flex items-center gap-2">
                            <span>Sold by {clipping.seller.username}</span>

                            {#if clipping.seller.is_verified_seller}
                                <span class="badge preset-filled-success-100-900">
                                    ✓ Verified
                                </span>
                            {/if}
                        </div>
                        <span class="text-xs">More by <a class="anchor" href="/account/{clipping.seller.username}">{clipping.seller.username}</a></span>
                        </div>
                    {/if}

                    <h1 class="text-4xl font-serif">
                        {clipping.title}
                    </h1>

                    <div class="flex items-center gap-4">
                        <span class="text-3xl font-bold">
                            € {clipping.price.toFixed(2)}
                        </span>

                        <span class="badge preset-tonal-surface">
                            {clipping.negotiable ? 'Negotiable' : 'Fixed price'}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-3">

                        <div class="card preset-filled-surface-200-800 p-4">
                            <div class="text-xs uppercase opacity-60">
                                Stock
                            </div>

                            <div class="font-semibold">
                                {clipping.stock === -1 ? 'Made to order' : clipping.stock > 0 ? clipping.stock : 'Out of stock'}
                            </div>
                        </div>

                        {#if ratingDisplay}
                            <div class="card preset-filled-surface-200-800 p-4">
                                <div class="text-xs uppercase opacity-60">
                                    Rating
                                </div>

                                <div class="font-semibold">
                                    ⭐ {ratingDisplay}
                                </div>
                            </div>
                        {/if}

                    </div>

                    {#if clipping.description}
                        <div class="card preset-filled-surface-200-800 p-4 whitespace-pre-wrap">
                            {clipping.description}
                        </div>
                    {/if}

                    <div class="flex gap-3 flex-wrap">

                        {#if !isOwner}
                            <button
                                class="btn flex-1 {clipping.stock !== -1 && clipping.stock <= 0 ? 'preset-tonal-surface opacity-50 cursor-not-allowed' : 'preset-filled-primary-50-950'}"
                                onclick={handleBuy}
                                disabled={clipping.stock !== -1 && clipping.stock <= 0}
                            >
                                {clipping.stock === -1 || clipping.stock > 0 ? 'Show Interest' : 'Out of Stock'}
                            </button>
                        {/if}

                        {#if isOwner}

                            <button
                                class="btn preset-tonal-surface"
                                onclick={handleEdit}
                            >
                                Edit
                            </button>

                        {/if}

                    </div>

                </div>

            </div>

        {/if}

    </div>
</div>

{#if showModal && clipping}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center" role="presentation" onclick={() => (showModal = false)} onkeydown={(e) => e.key === 'Escape' && (showModal = false)}>

    <div class="card preset-filled-surface-200-800 p-4 flex flex-col gap-2 w-full max-w-md" role="dialog" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>

        <textarea
            class="input"
            bind:value={message}
            placeholder="Message"
        ></textarea>

        {#if clipping?.negotiable}
            <input
                type="number"
                class="input"
                bind:value={offer}
                placeholder="Offer"
            />
        {/if}

            <input
                type="number"
                class="input"
                bind:value={quantiny}
                min="1"
                max={clipping.stock > 0 ? clipping.stock : undefined}
                placeholder="Quantity"
            />

        {#if errorMsg}
            <span class="text-error-500">{errorMsg}</span>
        {/if}

        <div class="flex gap-2 justify-end">
            <button class="btn preset-tonal-surface" onclick={() => (showModal = false)}>
                Cancel
            </button>

            <button class="btn preset-filled-primary-50-950" onclick={sendRequest}>
                Send
            </button>
        </div>

    </div>

</div>
{/if}
