<script lang="ts">
    import { onMount } from 'svelte';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import apiCaller from '$lib/axiosConfig';
    import { toaster } from '$lib/toast';

    type PendingRequest = {
        id: number;
        item?: any;
        item_id?: number | null;
        item_title?: string | null;
        message?: string | null;
        offer_price?: number | null;
        quantity?: number | null;
        created_at?: string | null;
        buyer?: any;
        [key: string]: any;
    };

    const getItemInfo = (req: PendingRequest) => {
        const itemObj = req.item;
        const itemId =
            req.item_id ??
            (itemObj && typeof itemObj === 'object' ? itemObj.id ?? itemObj.pk : undefined);

        const title =
            req.item_title ??
            (itemObj && typeof itemObj === 'object'
                ? itemObj.title ?? itemObj.name
                : typeof itemObj === 'string'
                ? itemObj
                : undefined);

        return { itemId, title };
    };

    const getBuyerName = (req: PendingRequest) => {
        return req.buyer_username;
    };

    let loading = $state(true);
    let error = $state<string | null>(null);
    let requests = $state<PendingRequest[]>([]);

    const fetchRequests = async () => {
        loading = true;
        error = null;

        if (!loggedUser.id) {
            error = 'You must be logged in to view interest offers.';
            loading = false;
            return;
        }

        try {
            const res = await apiCaller.get<PendingRequest[]>('/pendingrequests/list/');
            requests = res.data;
        } catch (e: any) {
            console.error('Failed to fetch interest offers', e);
            const data = e?.response?.data;
            if (data) {
                error =
                    data.detail ||
                    (typeof data === 'string' ? data : JSON.stringify(data));
            } else {
                error = 'Failed to load interest offers.';
            }
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        fetchRequests();
    });

    const formatDate = (iso?: string | null) => {
        if (!iso) return '-';
        const d = new Date(iso);
        return isNaN(d.getTime()) ? iso : d.toLocaleString();
    };
</script>

<div class="max-w-6xl mx-auto p-8">
    <h1 class="text-3xl font-semibold mb-4">Interest Offers</h1>

    {#if loading}
        <div class="flex flex-col items-center gap-3 py-20">
            <div class="spinner"></div>
            <span>Loading offers…</span>
        </div>

    {:else if error}
        <div class="text-center py-20 text-error-500">
            ⚠ {error}
        </div>

    {:else if requests.length === 0}
        <div class="text-center py-20">
            <p class="text-lg">No interest offers yet.</p>
            <p class="text-sm text-surface-500">When someone sends an offer, it will appear here.</p>
        </div>

    {:else}
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-xs uppercase text-surface-500 border-b border-surface-200">
                        <th class="py-2 px-3">Item</th>
                        <th class="py-2 px-3">From</th>
                        <th class="py-2 px-3">Quantity</th>
                        <th class="py-2 px-3">Offer</th>
                        <th class="py-2 px-3">Message</th>
                        <th class="py-2 px-3">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {#each requests as req}
                        {@const itemInfo = getItemInfo(req)}
                        {@const buyerName = getBuyerName(req)}
                        <tr class="border-b border-surface-200">
                            <td class="py-2 px-3">
                                {#if itemInfo.itemId}
                                    <a class="anchor" href={`/clipping/${itemInfo.itemId}`}>
                                        {itemInfo.title ?? `Item #${itemInfo.itemId}`}
                                    </a>
                                {:else}
                                    {itemInfo.title ?? '-'}
                                {/if}
                            </td>
                            <td class="py-2 px-3">{buyerName ?? '-'}</td>
                            <td class="py-2 px-3">{req.quantity ?? '-'}</td>
                            <td class="py-2 px-3">{req.offer_price != null ? `€ ${req.offer_price}` : '-'}</td>
                            <td class="py-2 px-3 break-words max-w-xs">{req.message ?? '-'}</td>
                            <td class="py-2 px-3">{formatDate(req.created_at)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
