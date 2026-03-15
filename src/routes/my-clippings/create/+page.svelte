<script lang="ts">
  import { goto } from '$app/navigation';
  import apiCaller from '$lib/axiosConfig';
  import { toaster } from '$lib/toast';
  import { ImageIcon } from '@lucide/svelte';
  import { FileUpload, TagsInput } from '@skeletonlabs/skeleton-svelte';

  let title = '';
  let description = '';
  let price = '';
  let stock = 1;
  let infiniteStock = false;
  let negotiable = false;
  let min_negotiable_price = '';
  let tagsArray: string[] = [];

  let images: File[] = [];
  let loading = false;

  const onFileAccept = (event: any) => {
    const { files } = event;
    
    if (!files || files.length === 0) return;

    let selected = [...images, ...files];
    if (selected.length > 3) {
      toaster.create({ type: 'error', description: 'You can only upload up to 3 images' });
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

    images = validFiles.slice(0, 3);
  };

  const onFileReject = () => {
    toaster.create({ type: 'error', description: 'File rejected. Unsupported type or size.' });
  };

  async function createItem() {
    if (!title || !description || !price) {
      toaster.create({ type: 'error', description: 'Please fill in all required fields' });
      return;
    }

    if (negotiable && (!min_negotiable_price || parseFloat(min_negotiable_price) < 0)) {
      toaster.create({ type: 'error', description: 'Enter a valid minimum negotiable price' });
      return;
    }

    loading = true;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', infiniteStock ? '-1' : Math.max(stock, 1).toString());
    formData.append('negotiable', negotiable.toString());

    if (negotiable && min_negotiable_price) {
      formData.append('min_negotiable_price', min_negotiable_price);
    }

    formData.append('tags', JSON.stringify(tagsArray));

    images.forEach(img => formData.append('images', img));

    try {
      await apiCaller.post("/item/my-clippings/create/", formData);

      toaster.create({ type: 'success', description: 'Item created successfully! 🎉' });

      setTimeout(() => goto('/my-clippings'), 1500);

    } catch (err: any) {
      toaster.create({ type: 'error', description: err.response?.data?.detail || err.message || 'Failed to create item' });
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

        <!-- Basic Info -->
        <section>
          <h4 class="h4 mb-4">Basic Information</h4>
          <div class="space-y-4">
            <label class="label">
              <span class="font-semibold">Title <span class="text-error-500">*</span></span>
              <input type="text" class="input" bind:value={title} placeholder="e.g., Vintage Leather Jacket" required />
            </label>
            <label class="label">
              <span class="font-semibold">Description <span class="text-error-500">*</span></span>
              <textarea class="textarea" bind:value={description} rows="5" placeholder="Describe your item in detail..." required></textarea>
              <small class="opacity-70">Tip: Be detailed to attract more buyers</small>
            </label>
          </div>
        </section>

        <hr class="opacity-20" />

        <!-- Pricing & Stock -->
        <section>
          <h4 class="h4 mb-4">Pricing & Stock</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label class="label">
              <span class="font-semibold">Price ($) <span class="text-error-500">*</span></span>
              <input type="number" step="0.01" min="0" class="input" bind:value={price} placeholder="0.00" required />
            </label>
            <label class="label">
              <span class="font-semibold">Stock Quantity</span>
              <input type="number" class="input" bind:value={stock} min="1" disabled={infiniteStock} class:opacity-50={infiniteStock} placeholder={infiniteStock ? "∞ Infinite" : "1"} />
            </label>
          </div>

          <div class="card preset-tonal-surface p-4 space-y-3 mb-4">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" class="checkbox" bind:checked={infiniteStock} />
              <div>
                <span class="font-semibold">Infinite Stock</span>
                <p class="text-xs opacity-70">Item is always available (digital products, services, etc.)</p>
              </div>
            </label>
          </div>

          <div class="card preset-tonal-surface p-4 space-y-3">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" class="checkbox" bind:checked={negotiable} />
              <div>
                <span class="font-semibold">Price is negotiable</span>
                <p class="text-xs opacity-70">Allow buyers to make offers</p>
              </div>
            </label>

            {#if negotiable}
              <div class="ml-8 animate-fade-in">
                <label class="label">
                  <span class="font-semibold">Minimum Acceptable Price ($)</span>
                  <input type="number" step="0.01" min="0" class="input" bind:value={min_negotiable_price} placeholder="0.00" />
                  <small class="opacity-70">The lowest price you'll accept</small>
                </label>
              </div>
            {/if}
          </div>
        </section>

        <hr class="opacity-20" />

        <!-- Tags -->
        <section>
          <h4 class="h4 mb-4">Tags</h4>
          <label class="label">
            <span class="font-semibold">Add tags to help buyers find your item</span>
            <TagsInput onValueChange={(e) => (tagsArray = e.value)} validate={(d) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.inputValue)} editable={false}>
              <TagsInput.Control>
                <TagsInput.Context>
                  {#snippet children(tagsInput)}
                    {#each tagsInput().value as value, index (index)}
                      <TagsInput.Item {value} {index}>
                        <TagsInput.ItemPreview>
                          <TagsInput.ItemText>{value}</TagsInput.ItemText>
                          <TagsInput.ItemDeleteTrigger />
                        </TagsInput.ItemPreview>
                        <TagsInput.ItemInput />
                      </TagsInput.Item>
                    {/each}
                  {/snippet}
                </TagsInput.Context>
                <TagsInput.Input placeholder="Add a tag..." />
              </TagsInput.Control>
            </TagsInput>
            <small class="opacity-70">Separate tags with commas</small>
          </label>
        </section>

        <hr class="opacity-20" />

        <!-- Images -->
        <section>
          <h4 class="h4 mb-2">Item Images</h4>
          <p class="text-sm opacity-75 mb-4">Upload up to 3 high-quality images (max 5MB each)</p>

          <FileUpload class="w-full" {onFileAccept} {onFileReject} maxFiles={3}>
            <FileUpload.Trigger class="btn preset-filled-surface-500 w-full justify-center">
              <ImageIcon class="mr-2" />
              Browse Images
            </FileUpload.Trigger>
            <FileUpload.HiddenInput multiple accept="image/*" />
            <FileUpload.ItemGroup>
              <FileUpload.Context>
                {#snippet children(fileUpload)}
                  {#each fileUpload().acceptedFiles as file (file.name)}
                    <FileUpload.Item {file}>
                      <FileUpload.ItemName>{file.name}</FileUpload.ItemName>
                      <FileUpload.ItemSizeText>{(file.size / 1024).toFixed(2)} KB</FileUpload.ItemSizeText>
                      <FileUpload.ItemDeleteTrigger />
                    </FileUpload.Item>
                  {/each}
                {/snippet}
              </FileUpload.Context>
            </FileUpload.ItemGroup>
          </FileUpload>
        </section>

        <!-- Submit -->
        <div class="pt-4">
          <button class="btn preset-filled-primary-500 w-full text-lg font-semibold" onclick={createItem} disabled={loading}>
            {#if loading}<span class="animate-pulse">Creating Item...</span>{:else}Create Item{/if}
          </button>
        </div>

      </div>
    </div>
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>