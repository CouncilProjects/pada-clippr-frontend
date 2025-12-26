<script lang="ts">
    import { page } from '$app/state';
    import apiCaller from '$lib/axiosConfig';

    const fallback =
        'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

    interface Clipping {
        id: number;
        title: string;
        price: number;
        rating?: number;
        stock: number;
        negotiable: boolean;
        description?: string;
        thumbnail?: string | null;
        images?: string[];
    }

    let clipping = $state<Clipping | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    const images = $derived.by(() => {
        if (!clipping) return [];
        return [
            ...(clipping.thumbnail ? [clipping.thumbnail] : []),
            ...(Array.isArray(clipping.images) ? clipping.images : [])
        ].filter(Boolean);
    });


    $effect(() => {
    const clipId = page.params.clipId;
    if (!clipId) return;

    const fetchClipping = async () => {
        loading = true;
        error = null;

        try {
            const res = await apiCaller.get(`/item/${clipId}/`);
            
            // Debug: log the actual response
            console.log('Response data:', res.data);
            
            // Check if we got valid data
            if (!res.data || typeof res.data.price === 'undefined') {
                throw new Error('Invalid response from server');
            }
            
            clipping = {
                ...res.data,
                // Ensure price is a number
                price: Number(res.data.price),
                rating: res.data.rating ? Number(res.data.rating) : undefined,
                stock: Number(res.data.stock)
            };
        } catch (err: any) {
            console.error('Fetch error:', err);
            
        } finally {
            loading = false;
        }
    };

    fetchClipping();
});

    const goBack = () => {
        history.length > 1 ? history.back() : (window.location.href = '/');
    };
</script>

<div class="p-4 max-w-4xl mx-auto">
    <button
        class="mb-4 opacity-70 hover:opacity-100"
        onclick={goBack}
    >
        ← Back
    </button>

    {#if loading}
        <div class="text-center p-8 opacity-60">
            Loading…
        </div>

    {:else if error}
        <div class="text-center p-8 text-red-500">
            {error}
        </div>

    {:else if clipping}
        <div class="card p-4 flex flex-col gap-6">

            {#if images.length}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each images as img, i (img)}
                        <img
                            src={img}
                            alt={`${clipping.title} image ${i + 1}`}
                            class="rounded-md w-full object-cover"
                            loading="lazy"
                            onerror={(e) =>
                                ((e.currentTarget as HTMLImageElement).src = fallback)
                            }
                        />
                    {/each}
                </div>
            {:else}
                <img
                    src={fallback}
                    alt=""
                    class="rounded-md w-full object-cover"
                />
            {/if}

            <section class="flex flex-col gap-2">
                <h1 class="text-2xl font-bold">
                    {clipping.title}
                </h1>

                <div class="text-lg font-medium">
                    € {clipping.price.toFixed(2)}
                </div>

                {#if clipping.rating !== undefined}
                    <div>Rating: {clipping.rating}</div>
                {/if}

                <div>Stock: {clipping.stock}</div>

                <div>
                    {clipping.negotiable
                        ? 'Negotiable'
                        : 'Non-negotiable'}
                </div>

                {#if clipping.description}
                    <p class="mt-4 whitespace-pre-wrap">
                        {clipping.description}
                    </p>
                {/if}
            </section>
        </div>
    {/if}
</div>
