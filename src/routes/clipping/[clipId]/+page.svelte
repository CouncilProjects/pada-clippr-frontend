<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import apiCaller from '$lib/axiosConfig';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';

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
;
    });

    const ratingDisplay = $derived.by(() => {
        if (clipping?.rating == null) return null;

        const r = Number(clipping.rating);
        if (isNaN(r) || r < 0) return null;

        return r.toFixed(1);
    });


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
        if (!clipping || clipping.stock <= 0) return;
        console.log('Buy clicked', clipping.id);
    };

    const handleEdit = () => {
        if (!clipping) return;
        window.location.href = `/clipping/${clipping.id}/edit`;
    };

    const handleDelete = async () => {
        if (!clipping) return;

        if (!confirm('Delete this listing?')) return;

        console.log('Delete clicked', clipping.id);
    };
</script>

<div class="min-h-screen p-8 bg-surface-50-950 text-surface-900-100">
    <div class="max-w-6xl mx-auto">

        <button class="btn preset-tonal-surface mb-6" onclick={() => goto('/my-clippings')}>
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
                        <div class="text-sm uppercase tracking-wider text-surface-500 flex items-center gap-2">
                            <span>Sold by {clipping.seller.username}</span>

                            {#if clipping.seller.is_verified_seller}
                                <span class="badge preset-filled-success-100-900">
                                    ✓ Verified
                                </span>
                            {/if}
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
                                {clipping.stock > 0 ? clipping.stock : 'Out of stock'}
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
                                class="btn preset-filled-primary-50-950 flex-1"
                                onclick={handleBuy}
                                disabled={clipping.stock <= 0}
                            >
                                {clipping.stock > 0 ? 'Show Interest' : 'Out of Stock'}
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
