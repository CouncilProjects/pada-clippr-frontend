<script lang="ts">
    import { onMount } from 'svelte';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import apiCaller from '$lib/axiosConfig';

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
        buyer_id?: number | null;
        buyer_username?: string | null;
        response?: boolean | null;
        [key: string]: any;
    };

    const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

    const formatCurrency = (value?: number | null) =>
        value == null || Number.isNaN(Number(value)) ? '-' : euro.format(Number(value));

    const getStatus = (req: PendingRequest) => {
        if (req.response === null || req.response === undefined) return 'Pending';
        return req.response ? 'Accepted' : 'Rejected';
    };

    const statusClass = (req: PendingRequest) => {
        const s = getStatus(req);
        if (s === 'Accepted') return 'text-success-700 bg-success-50';
        if (s === 'Rejected') return 'text-error-700 bg-error-50';
        return 'text-warning-700 bg-warning-50';
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
        if (req.buyer_username) return req.buyer_username;
        if (req.buyer && typeof req.buyer === 'object') return req.buyer.username ?? req.buyer.name ?? null;
        return null;
    };

    let loading = $state(true);
    let error = $state<string | null>(null);
    let requests = $state<PendingRequest[]>([]);
    let showModal = $state(false);
    let selectedRequest = $state<PendingRequest | null>(null);
    let actionType = $state<'accept' | 'reject' | null>(null);
    let actionMessage = $state('');
    let submitting = $state(false);
    let showHistory = $state(false);

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
            requests = (res.data ?? []) as PendingRequest[];
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

            requests = requests.map((r) =>
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

            requests = requests.map((r) =>
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

<div class="max-w-6xl mx-auto p-8">
    <div class="flex items-center justify-between gap-4 mb-4">
        <h1 class="text-3xl font-semibold">Interest Offers</h1>
        <button class="btn btn-sm" onclick={fetchRequests} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
        </button>
    </div>

    {#if loading}
        <div class="flex flex-col items-center gap-3 py-20">
            <div class="spinner"></div>
            <span>Loading offers…</span>
        </div>
    {:else if error}
        <div class="text-center py-20 text-error-500">
            <p>⚠ {error}</p>
            <button class="btn btn-sm mt-3" onclick={fetchRequests}>Retry</button>
        </div>
    {:else}
        {@const sortedRequests = [...requests].sort(
            (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        )}
        {@const activeRequests = sortedRequests.filter((req) => req.response == null)}
        {@const historyRequests = sortedRequests.filter((req) => req.response != null)}

        <div class="space-y-8">
            <section>
                <div class="flex items-center justify-between mb-2">
                    <h2 class="text-xl font-semibold">Active</h2>
                    <span class="text-sm text-surface-500">{activeRequests.length}</span>
                </div>

                {#if activeRequests.length === 0}
                    <div class="text-sm text-surface-500 border border-surface-200 rounded p-4">
                        No active offers.
                    </div>
                {:else}
                    <div class="overflow-x-auto border border-surface-200 rounded">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-xs uppercase text-surface-500 border-b border-surface-200">
                                    <th scope="col" class="py-2 px-3">Item</th>
                                    <th scope="col" class="py-2 px-3">From</th>
                                    <th scope="col" class="py-2 px-3">Quantity</th>
                                    <th scope="col" class="py-2 px-3">Offer</th>
                                    <th scope="col" class="py-2 px-3">Message</th>
                                    <th scope="col" class="py-2 px-3">Created</th>
                                    <th scope="col" class="py-2 px-3">Status</th>
                                    <th scope="col" class="py-2 px-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each activeRequests as req (req.id)}
                                    {@const itemInfo = getItemInfo(req)}
                                    {@const buyerName = getBuyerName(req)}

                                    <tr class="border-b border-surface-200 align-top">
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
                                        <td class="py-2 px-3">{formatCurrency(req.offer_price ?? itemInfo.price)}</td>
                                        <td class="py-2 px-3 break-words max-w-xs">{req.message ?? '-'}</td>
                                        <td class="py-2 px-3 whitespace-nowrap">{formatDate(req.created_at)}</td>
                                        <td class="py-2 px-3">
                                            <span class={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(req)}`}>
                                                {getStatus(req)}
                                            </span>
                                        </td>
                                        <td class="py-2 px-3">
                                            <div class="flex gap-2">
                                                <button
                                                    class="bg-green-600 text-white px-2 py-1 rounded"
                                                    onclick={() => openModal(req, 'accept')}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    class="bg-red-600 text-white px-2 py-1 rounded"
                                                    onclick={() => handleReject(req.id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </section>

            <section>
                <div class="flex items-center justify-between mb-2">
                    <button
                        class="flex items-center gap-2 text-xl font-semibold"
                        onclick={() => (showHistory = !showHistory)}
                    >
                        <span>History</span>
                        <span class="text-base">{showHistory ? '▾' : '▸'}</span>
                    </button>
                    <span class="text-sm text-surface-500">{historyRequests.length}</span>
                </div>

                {#if showHistory}
                    {#if historyRequests.length === 0}
                        <div class="text-sm text-surface-500 border border-surface-200 rounded p-4">
                            No history yet.
                        </div>
                    {:else}
                        <div class="overflow-x-auto border border-surface-200 rounded">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="text-xs uppercase text-surface-500 border-b border-surface-200">
                                        <th scope="col" class="py-2 px-3">Item</th>
                                        <th scope="col" class="py-2 px-3">From</th>
                                        <th scope="col" class="py-2 px-3">Quantity</th>
                                        <th scope="col" class="py-2 px-3">Offer</th>
                                        <th scope="col" class="py-2 px-3">Message</th>
                                        <th scope="col" class="py-2 px-3">Created</th>
                                        <th scope="col" class="py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each historyRequests as req (req.id)}
                                        {@const itemInfo = getItemInfo(req)}
                                        {@const buyerName = getBuyerName(req)}

                                        <tr class="border-b border-surface-200 align-top">
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
                                            <td class="py-2 px-3">{formatCurrency(req.offer_price ?? itemInfo.price)}</td>
                                            <td class="py-2 px-3 break-words max-w-xs">{req.message ?? '-'}</td>
                                            <td class="py-2 px-3 whitespace-nowrap">{formatDate(req.created_at)}</td>
                                            <td class="py-2 px-3">
                                                <span class={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(req)}`}>
                                                    {getStatus(req)}
                                                </span>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                {/if}
            </section>
        </div>
    {/if}
</div>

{#if showModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {actionType === 'accept' ? 'Accept Request' : 'Reject Request'}
            </h2>

            <textarea
                class="mb-4 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                rows="3"
                bind:value={actionMessage}
                placeholder="Write a message (please include some way to contact you, like your email or Discord) to the buyer. This is required if accepting the request"
            ></textarea>

            <div class="flex justify-end gap-2">
                <button onclick={closeModal} class="btn preset-tonal">
                    Cancel
                </button>

                <button
                    onclick={submitAction}
                    disabled={submitting}
                    class="rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    class:bg-green-600={actionType === 'accept'}
                    class:hover:bg-green-700={actionType === 'accept'}
                    class:bg-red-600={actionType === 'reject'}
                    class:hover:bg-red-700={actionType === 'reject'}
                >
                    {submitting ? 'Processing...' : 'Confirm'}
                </button>
            </div>
        </div>
    </div>
{/if}
