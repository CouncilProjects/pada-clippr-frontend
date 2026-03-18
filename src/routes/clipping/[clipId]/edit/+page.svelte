<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import apiCaller from '$lib/axiosConfig';
  import { toaster } from '$lib/toast';

  interface Clipping {
    id: number;
    title: string;
    price: number;
    stock: number;
    negotiable: boolean;
    description?: string;
    thumbnail?: string | null;
    images?: Array<{ id: number; image: string; order: number }>;
    ownerId?: number | null;
    seller?: { id: number; username: string; is_verified_seller: boolean } | null;
  }

  let loading = $state(true);
  let error = $state<string | null>(null);

  let title = $state('');
  let description = $state('');
  let price = $state<number | null>(null);
  let stock = $state(1);
  let negotiable = $state(false);

  $effect(() => {
    const clipId = page.params.clipId;
    if (!clipId) return;

    const loadItem = async () => {
      loading = true;
      error = null;

      try {
        const res = await apiCaller.get(`/item/${clipId}/`);
        const item: Clipping = {
          ...res.data,
          price: Number(res.data.price),
          stock: Number(res.data.stock),
          negotiable: Boolean(res.data.negotiable),
          description: res.data.description ?? '',
          title: res.data.title ?? '',
          ownerId: res.data.seller?.id ?? null,
          images: Array.isArray(res.data.images) ? res.data.images : []
        };

        title = item.title;
        description = item.description || '';
        price = Number(item.price ?? 0);
        stock = Number(item.stock ?? 1);
        negotiable = Boolean(item.negotiable ?? false);

        loading = false;
      } catch (err: any) {
        error = 'Failed to load listing.';
        console.error('Failed to fetch clipping for edit', err);
        loading = false;
      }
    };

    loadItem();
  });

  const handleUpdate = async () => {
    const clipId = page.params.clipId;
    if (!clipId) return;

    if (!title || !description || price === null) {
      toaster.create({
        type: 'error',
        description: 'Please fill in all required fields'
      });
      return;
    }

    loading = true;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('stock', Math.max(stock, 1).toString());
    formData.append('negotiable', negotiable.toString());


    try {
      await apiCaller.put(`/item/${clipId}/`, formData);
      toaster.create({ type: 'success', description: 'Listing updated successfully!' });
      goto(`/clipping/${clipId}`);
    } catch (err: any) {
      toaster.create({
        type: 'error',
        description: err.response?.data?.detail || err.message || 'Failed to update item'
      });
    } finally {
      loading = false;
    }
  };

  const handleDelete = async () => {
    const clipId = page.params.clipId;
    if (!clipId) return;

    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    loading = true;

    try {
      await apiCaller.delete(`/item/${clipId}/`);
      toaster.create({ type: 'success', description: 'Listing deleted successfully.' });
      goto('/my-clippings');
    } catch (err: any) {
      toaster.create({
        type: 'error',
        description: err.response?.data?.detail || err.message || 'Failed to delete item'
      });
    } finally {
      loading = false;
    }
  };

  const cancel = () => {
    goto(`/clipping/${page.params.clipId}`);
  };
</script>

<div class="container mx-auto p-4 max-w-3xl">
  <div class="card preset-filled-surface-300-700">
    <header class="card-header text-center">
      <h2 class="h2">Edit Listing</h2>
        <p class="text-sm opacity-75">Update your item details</p>
    </header>
    {#if loading}
      <div class="flex flex-col items-center gap-3 py-20">
        <div class="spinner"></div>
        <span>Loading listing…</span>
      </div>

    {:else if error}
      <div class="text-center py-20 text-error-500">
        ⚠ {error}
      </div>

    {:else}
      <div class="card preset-filled-surface-200-800 m-4">
        <div class="p-6 space-y-6">
          <section>
            <h4 class="h4 mb-4">Basic Information</h4>
            <div class="space-y-4">
              <label class="label">
                <span class="font-semibold">Title *</span>
                <input class="input" bind:value={title} required />
              </label>

              <label class="label">
                <span class="font-semibold">Description *</span>
                <textarea class="textarea" bind:value={description} rows="5" required></textarea>
              </label>
            </div>
          </section>

          <hr class="opacity-20" />

          <section>
            <h4 class="h4 mb-4">Pricing & Stock</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="label">
                <span class="font-semibold">Price ($) *</span>
                <input
                  type="number"
                  class="input"
                  min="0"
                  step="0.01"
                  bind:value={price}
                  placeholder="0.00"
                  required
                />
              </label>

              <label class="label">
                <span class="font-semibold">Stock Quantity</span>
                <input
                  type="number"
                  class="input"
                  min="1"
                  bind:value={stock}
                  placeholder="1"
                />
              </label>
            </div>

            <div class="card preset-tonal-surface p-4 mt-4">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" class="checkbox" bind:checked={negotiable} />
                <div>
                  <span class="font-semibold">Price is negotiable</span>
                  <p class="text-xs opacity-70">Allow buyers to make offers</p>
                </div>
              </label>


            </div>
          </section>

          <div class="flex flex-wrap gap-3 justify-between items-center">
            <button
              class="btn preset-filled-error-300-700"
              type="button"
              onclick={handleDelete}
              disabled={loading}
            >
              Delete Listing
            </button>

            <div class="flex flex-wrap gap-3 justify-end">
              <button class="btn preset-tonal-surface" type="button" onclick={cancel}>
                Cancel
              </button>
              <button
                class="btn preset-filled-primary-50-950"
                type="button"
                onclick={handleUpdate}
                disabled={loading}
              >
                Update Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
