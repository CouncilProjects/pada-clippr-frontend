<script lang="ts">
    import { page } from '$app/state';
    import apiCaller from '$lib/axiosConfig';

    const fallback =
        'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

    interface ImageEntry {
        id: number;
        image: string;
        order: number;
    }

    interface Seller {
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
    let currentUserId = $state<number | null>(null);
    let activeImage = $state<string | null>(null);

    // Collect all image URLs, sorted by order
  const allImages = $derived.by(() => {
    if (!clipping) return [];
    if (Array.isArray(clipping.images) && clipping.images.length > 0) {
      return [...clipping.images]
        .sort((a, b) => a.order - b.order)
        .map((entry) => entry.image)
        .filter(Boolean) as string[];
    } else if (clipping.thumbnail) {
      return [clipping.thumbnail];
    }
    return [];
  });

  // Main image defaults to activeImage or first image or fallback
  const displayImage = $derived(activeImage ?? allImages[0] ?? fallback);

  // Thumbnails exclude the main image
  const thumbnails = $derived.by(() => {
    if (!allImages || allImages.length <= 1) return [];
    return allImages.slice(1);
  });

    const isOwner = $derived.by(() =>
        Boolean(
            clipping?.ownerId != null &&
            currentUserId != null &&
            clipping.ownerId === currentUserId
        )
    );

    const ratingDisplay = $derived.by(() => {
        if (clipping?.rating == null) return null;
        const r = Number(clipping.rating);
        if (isNaN(r) || r < 0) return null;
        return r.toFixed(1);
    });

    const fetchCurrentUserId = () => {
        const stored = localStorage.getItem('userId');
        currentUserId = stored ? Number(stored) : null;
    };

    $effect(() => {
        fetchCurrentUserId();

        const clipId = page.params.clipId;
        if (!clipId) return;

        const fetchClipping = async () => {
            loading = true;
            error = null;

            try {
                const res = await apiCaller.get(`/item/${clipId}/`);
                console.log('Response data:', res.data);

                if (!res.data || typeof res.data.price === 'undefined') {
                    throw new Error('Invalid response from server');
                }

                clipping = {
                    ...res.data,
                    price: Number(res.data.price),
                    rating: res.data.rating != null ? Number(res.data.rating) : undefined,
                    stock: Number(res.data.stock),
                    ownerId: res.data.ownerId ?? res.data.owner_id ?? null,
                    images: Array.isArray(res.data.images) ? res.data.images : [],
                };

                activeImage = null;
            } catch (err: any) {
                console.error('Fetch error:', err);
                error = 'Failed to load listing.';
            } finally {
                loading = false;
            }
        };

        fetchClipping();
    });

    const goBack = () => {
        history.length > 1 ? history.back() : (window.location.href = '/');
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

<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

    :global(body) {
        background-color: #f5f2ee;
        font-family: 'DM Sans', sans-serif;
    }

    .page {
        min-height: 100vh;
        background: #f5f2ee;
        padding: 2rem 1rem 4rem;
    }

    .container {
        max-width: 1080px;
        margin: 0 auto;
    }

    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #7a6e63;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem 0;
        margin-bottom: 2rem;
        transition: color 0.2s;
    }

    .back-btn:hover { color: #2a221a; }

    /* ── Grid ── */
    .product-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start;
    }

    @media (max-width: 700px) {
        .product-grid { grid-template-columns: 1fr; gap: 2rem; }
    }

    /* ── Gallery ── */
    .gallery { display: flex; flex-direction: column; gap: 0.75rem; }

    .main-image-wrap {
        position: relative;
        background: #e8e2d9;
        border-radius: 16px;
        overflow: hidden;
        aspect-ratio: 4/3;
    }

    .main-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
    }

    .main-image-wrap:hover .main-image { transform: scale(1.03); }

    .thumbnails {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .thumb-btn {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        padding: 0;
        cursor: pointer;
        background: #e8e2d9;
        transition: border-color 0.2s, opacity 0.2s;
        flex-shrink: 0;
    }

    .thumb-btn:hover { opacity: 0.85; }
    .thumb-btn.active { border-color: #2a221a; }

    .thumb-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    /* ── Info Panel ── */
    .info { display: flex; flex-direction: column; gap: 1.5rem; }

    .seller-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #7a6e63;
    }

    .verified-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background: #e6f4ea;
        color: #2e7d32;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        padding: 0.15rem 0.5rem;
        border-radius: 20px;
    }

    .title {
        font-family: 'DM Serif Display', serif;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        line-height: 1.1;
        color: #1a1410;
        margin: 0;
    }

    .price-row {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
    }

    .price {
        font-family: 'DM Serif Display', serif;
        font-size: 2rem;
        color: #1a1410;
    }

    .negotiable-tag {
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        background: #f0ece6;
        color: #7a6e63;
    }

    .negotiable-tag.yes {
        background: #fff8e1;
        color: #b45309;
    }

    .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .meta-item {
        background: #edeae4;
        border-radius: 10px;
        padding: 0.75rem 1rem;
    }

    .meta-label {
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9a8e84;
        margin-bottom: 0.2rem;
    }

    .meta-value {
        font-size: 0.95rem;
        font-weight: 500;
        color: #1a1410;
    }

    .meta-value.out { color: #c0392b; }

    .description {
        font-size: 0.92rem;
        line-height: 1.7;
        color: #4a3f36;
        white-space: pre-wrap;
        background: #edeae4;
        border-radius: 10px;
        padding: 1rem 1.2rem;
    }

    /* ── Actions ── */
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.85rem 2rem;
        border-radius: 100px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        cursor: pointer;
        border: none;
        transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s;
    }

    .btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }

    .btn:active:not(:disabled) { transform: translateY(0); }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-buy {
        background: #1a1410;
        color: #f5f2ee;
        flex: 1;
        min-width: 140px;
    }

    .btn-edit {
        background: #f5f2ee;
        color: #1a1410;
        border: 1.5px solid #c9c3bb;
    }

    .btn-delete {
        background: #fef2f2;
        color: #c0392b;
        border: 1.5px solid #fca5a5;
    }

    /* ── States ── */
    .state-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        gap: 1rem;
        color: #7a6e63;
        font-size: 0.95rem;
    }

    .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #ddd;
        border-top-color: #1a1410;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-icon { font-size: 2rem; }
</style>

<div class="page">
    <div class="container">
        <button class="back-btn" onclick={goBack}>
            ← Back
        </button>

        {#if loading}
            <div class="state-box">
                <div class="spinner"></div>
                <span>Loading listing…</span>
            </div>

        {:else if error}
            <div class="state-box">
                <span class="error-icon">⚠</span>
                <span>{error}</span>
            </div>

        {:else if clipping}
            <div class="product-grid">

                <!-- Gallery -->
                <div class="gallery">
                    <div class="main-image-wrap">
                        <img
                            class="main-image"
                            src={displayImage}
                            alt={clipping.title}
                            onerror={(e) =>
                                ((e.currentTarget as HTMLImageElement).src = fallback)}
                        />
                    </div>

                    {#if allImages.length > 1}
                        <div class="thumbnails">
                            {#each allImages.slice(1) as img, i (img)}
                                <button
                                    class="thumb-btn"
                                    class:active={displayImage === img}
                                    onclick={() => (activeImage = img)}
                                    aria-label={`View image ${i + 1}`}
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        onerror={(e) =>
                                            ((e.currentTarget as HTMLImageElement).src = fallback)}
                                    />
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Info -->
                <div class="info">

                    {#if clipping.seller}
                        <div class="seller-row">
                            <span>Sold by {clipping.seller.username}</span>
                            {#if clipping.seller.is_verified_seller}
                                <span class="verified-badge">✓ Verified</span>
                            {/if}
                        </div>
                    {/if}

                    <h1 class="title">{clipping.title}</h1>

                    <div class="price-row">
                        <span class="price">€ {clipping.price.toFixed(2)}</span>
                        <span class="negotiable-tag" class:yes={clipping.negotiable}>
                            {clipping.negotiable ? 'Negotiable' : 'Fixed price'}
                        </span>
                    </div>

                    <div class="meta-grid">
                        <div class="meta-item">
                            <div class="meta-label">Stock</div>
                            <div class="meta-value" class:out={clipping.stock <= 0}>
                                {clipping.stock > 0 ? clipping.stock : 'Out of stock'}
                            </div>
                        </div>

                        {#if ratingDisplay}
                            <div class="meta-item">
                                <div class="meta-label">Rating</div>
                                <div class="meta-value">⭐ {ratingDisplay}</div>
                            </div>
                        {/if}
                    </div>

                    {#if clipping.description}
                        <p class="description">{clipping.description}</p>
                    {/if}

                    <div class="actions">
                        <button
                            class="btn btn-buy"
                            onclick={handleBuy}
                            disabled={clipping.stock <= 0}
                        >
                            {clipping.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                        </button>

                        {#if isOwner}
                            <button class="btn btn-edit" onclick={handleEdit}>
                                Edit
                            </button>
                            <button class="btn btn-delete" onclick={handleDelete}>
                                Delete
                            </button>
                        {/if}
                    </div>

                </div>
            </div>
        {/if}
    </div>
</div>