<script lang="ts">
    import { onMount } from 'svelte';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import apiCaller from '$lib/axiosConfig';
    import { toaster } from '$lib/toast';
    import { PrinterCheck } from '@lucide/svelte';

    type PendingRequest = {
        id: number;
        item?: any;
        item_id?: number | null;
        item_title?: string | null;
        item_price?: number | null;
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

        const price =
            req.item_price != null
                ? Number(req.item_price)
                : itemObj && typeof itemObj === 'object' && itemObj.price != null
                ? Number(itemObj.price)
                : undefined;

        return { itemId, title, price };
    };

    const getBuyerName = (req: PendingRequest) => {
        return req.buyer_username;
    };

    let loading = $state(true);
    let error = $state<string | null>(null);
    let requests = $state<PendingRequest[]>([]);
    let showModal = $state(false);
    let selectedRequest = $state<PendingRequest | null>(null);
    let actionType = $state<'accept' | 'reject' | null>(null);
    let actionMessage = $state('');
    let submitting = $state(false);

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

    const openModal = (req: PendingRequest, action: 'accept') => {
        selectedRequest = req;
        actionType = action;
        actionMessage = '';
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        selectedRequest = null;
        actionType = null;
    };



    const handleReject = async (id: number) => {
    try {
        await apiCaller.post(`/pendingrequests/${id}/action/`, {
            response: false,
            message: ''
        });

        requests = requests.map(r =>
            r.id === id ? { ...r, response: false } : r
        );


    } catch (e) {
        console.error(e);
        
    }
};

const submitAction = async () => {
    if (!selectedRequest || !actionType) return;

    submitting = true;

    try {
        const response = actionType === 'accept';

        await apiCaller.post(`/pendingrequests/${selectedRequest.id}/action/`, {
            response,
            message: actionMessage
        });

        requests = requests.map(r =>
            selectedRequest && r.id === selectedRequest.id ? { ...r, response } : r
        );

        closeModal();
    } catch (e) {
        console.error(e);
    } finally {
        submitting = false;
    }
};

</script>

<div class="max-w-6xl mx-auto p-8 bg-surface-100-900 rounded-xl shadow-lg">
    <h1 class="text-3xl font-semibold mb-4 text-surface-900 dark:text-surface-100">Interest Offers</h1>

    {#if loading}
        <div class="flex flex-col items-center gap-3 py-20">
            <div class="spinner"></div>
            <span class="text-surface-900 dark:text-surface-100">Loading offers…</span>
        </div>

    {:else if error}
        <div class="text-center py-20 text-error-500 dark:text-error-400">
            ⚠ {error}
        </div>

    {:else if requests.length === 0}
        <div class="text-center py-20">
            <p class="text-lg text-surface-900 dark:text-surface-100">No interest offers yet.</p>
            <p class="text-sm text-surface-500 dark:text-surface-400">When someone sends an offer, it will appear here.</p>
        </div>

    {:else}
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse bg-surface-200-900 rounded-lg">
                <thead>
                    <tr class="text-xs uppercase text-surface-500 dark:text-surface-300 border-b border-surface-200 dark:border-surface-700">
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
                        <tr class="border-b border-surface-200 dark:border-surface-700">
                            <td class="py-2 px-3 text-surface-900 dark:text-surface-100">
                                {#if itemInfo.itemId}
                                    <a class="anchor text-primary-600 dark:text-primary-400" href={`/clipping/${itemInfo.itemId}`}>
                                        {itemInfo.title ?? `Item #${itemInfo.itemId}`}
                                    </a>
                                {:else}
                                    {itemInfo.title ?? '-'}
                                {/if}
                            </td>
                            <td class="py-2 px-3 text-surface-900 dark:text-surface-100">{buyerName ?? '-'}</td>
                            <td class="py-2 px-3 text-surface-900 dark:text-surface-100">{req.quantity ?? '-'}</td>
                            <td class="py-2 px-3 text-surface-900 dark:text-surface-100">
                                {#if req.offer_price != null}
                                    € {req.offer_price}
                                {:else if itemInfo.price != null}
                                    € {itemInfo.price}
                                {:else}
                                    -
                                {/if}
                            </td>
                            <td class="py-2 px-3 break-words max-w-xs text-surface-900 dark:text-surface-100">{req.message ?? '-'}</td>
                            <td class="py-2 px-3 text-surface-900 dark:text-surface-100">{formatDate(req.created_at)}</td>

                            <td class="py-2 px-3">
                                {#if req.response === null}
                                    <div class="flex gap-2">
                                        <button
                                            class="bg-green-600 dark:bg-green-400 text-white dark:text-surface-900 px-2 py-1 rounded"
                                            onclick={() => openModal(req, 'accept')}
                                        >
                                            Accept
                                        </button>

                                        <button
                                            class="bg-red-600 dark:bg-red-400 text-white dark:text-surface-900 px-2 py-1 rounded"
                                            onclick={() => handleReject(req.id)}
                                        >
                                            Reject
                                        </button>
                                    </div>

                                {:else if req.response === true}
                                    <span class="text-green-600 dark:text-green-400 text-sm">Accepted</span>

                                {:else}
                                    <span class="text-red-600 dark:text-red-400 text-sm">Rejected</span>
                                {/if}
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
{#if showModal}
<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-surface-100-900 rounded-xl p-6 w-full max-w-md shadow-lg">

        <h2 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-100">
            {actionType === 'accept' ? 'Accept Request' : 'Reject Request'}
        </h2>

        <textarea
            class="w-full border border-surface-300 dark:border-surface-700 rounded-lg p-2 mb-4 bg-surface-200-900 text-surface-900 dark:text-surface-100"
            rows="3"
            bind:value={actionMessage}
            placeholder="Write a message (optional)..."
        ></textarea>

        <div class="flex justify-end gap-2">
            <button onclick={closeModal} class="btn preset-tonal">
                Cancel
            </button>

            <button
                onclick={submitAction}
                disabled={submitting}
                class="text-white px-4 py-2 rounded"
                class:bg-green-600={actionType === 'accept'}
                class:bg-red-600={actionType === 'reject'}
            >
                {submitting ? 'Processing...' : 'Confirm'}
            </button>
        </div>

    </div>
</div>
{/if}
