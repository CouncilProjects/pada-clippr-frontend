<script lang="ts">
  import { goto } from '$app/navigation';
  import apiCaller from '$lib/axiosConfig';
  import { toaster } from '$lib/toast';
  import { ImageIcon } from 'lucide-svelte';
  import { FileUpload, TagsInput } from '@skeletonlabs/skeleton-svelte';

  let title = $state('');
  let description = $state('');
  let price = $state<number | null>(null);
  let stock = $state(1);
  let infiniteStock = $state(false);

  let negotiable = $state(false);
  let min_negotiable_price = $state<number | null>(null);

  let tags = $state('');
  let images = $state<File[]>([]);
  let loading = $state(false);

  // Reset stock safely when infinite stock is enabled
  $effect(() => {
    if (infiniteStock) {
      stock = 1;
    }
  });

  const onFileAccept = (event: any) => {
    const { files } = event;
    if (!files?.length) return;

    let selected = [...images, ...files];

    if (selected.length > 3) {
      toaster.create({
        type: 'error',
        description: 'You can only upload up to 3 images'
      });
      selected = selected.slice(0, 3);
    }

    const validFiles: File[] = [];

    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        toaster.create({ type: 'error', description: 'Only image files are allowed' });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toaster.create({ type: 'error', description: 'Each file must be under 5MB' });
        continue;
      }
      validFiles.push(file);
    }

    images = validFiles;
  };

  const onFileReject = () => {
    toaster.create({
      type: 'error',
      description: 'File rejected. Unsupported type or size.'
    });
  };

  async function createItem() {
    if (!title || !description || price === null) {
      toaster.create({
        type: 'error',
        description: 'Please fill in all required fields'
      });
      return;
    }

    if (negotiable && (min_negotiable_price === null || min_negotiable_price < 0)) {
      toaster.create({
        type: 'error',
        description: 'Enter a valid minimum negotiable price'
      });
      return;
    }

    loading = true;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('stock', infiniteStock ? '-1' : Math.max(stock, 1).toString());
    formData.append('negotiable', negotiable.toString());

    if (negotiable && min_negotiable_price !== null) {
      formData.append('min_negotiable_price', min_negotiable_price.toString());
    }

    formData.append('tags', JSON.stringify(tagsArray));

    images.forEach(img => formData.append('images', img));

    try {
      await apiCaller.post('/item/my-clippings/create/', formData);
      toaster.create({ type: 'success', description: 'Item created successfully! 🎉' });
      setTimeout(() => goto('/my-clippings'), 1500);
    } catch (err: any) {
      toaster.create({
        type: 'error',
        description: err.response?.data?.detail || err.message || 'Failed to create item'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto p-4 max-w-3xl">
  <div class="card preset-filled-surface-300-700">
    <header class="card-header text-center">
      <h2 class="h2">Create New Item</h2>
      <p class="text-sm opacity-75">List your item on the marketplace</p>
    </header>

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
                class="input transition-all"
                min="1"
                bind:value={stock}
                disabled={infiniteStock}
                class:opacity-50={infiniteStock}
                class:cursor-not-allowed={infiniteStock}
                placeholder={infiniteStock ? '∞ Infinite' : '1'}
              />
            </label>
          </div>

          <div class="card preset-tonal-surface p-4 mt-4">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" class="checkbox" bind:checked={infiniteStock} />
              <div>
                <span class="font-semibold">Infinite Stock</span>
                <p class="text-xs opacity-70">For digital products or services</p>
              </div>
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

            {#if negotiable}
              <div class="ml-8 mt-3 animate-fade-in">
                <label class="label">
                  <span class="font-semibold">Minimum Acceptable Price ($)</span>
                  <input
                    type="number"
                    class="input"
                    min="0"
                    step="0.01"
                    bind:value={min_negotiable_price}
                    placeholder="0.00"
                  />
                  <small class="opacity-70">Must be $0.00 or higher</small>
                </label>
              </div>
            {/if}
          </div>
        </section>

        <hr class="opacity-20" />

        <section>
          <h4 class="h4 mb-4">Tags</h4>
          <input
            class="input"
            bind:value={tags}
            placeholder="vintage, clothing, leather"
          />
        </section>

        <hr class="opacity-20" />

        <section>
          <h4 class="h4 mb-2">Item Images</h4>
          <FileUpload class="w-full" {onFileAccept} {onFileReject} maxFiles={3}>
            <FileUpload.Trigger class="btn preset-filled-surface-500 w-full justify-center">
              <ImageIcon class="mr-2" />
              Browse Images
            </FileUpload.Trigger>
            <FileUpload.HiddenInput multiple accept="image/*" />
          </FileUpload>
        </section>

        <button
          class="btn preset-filled-primary-500 w-full text-lg"
          disabled={loading}
          onclick={createItem}
        >
          {loading ? 'Creating Item...' : 'Create Item'}
        </button>

      </div>
    </div>
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>