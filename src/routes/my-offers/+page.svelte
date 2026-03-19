<script lang="ts">
import { onMount } from 'svelte';
import { loggedUser } from '$lib/universalReactivity/auth.svelte';
import apiCaller from '$lib/axiosConfig';
import ReviewPopUp from '$lib/components/ReviewPopUp.svelte';

type PendingRequest = {
    id: number;
    item?: any;
    item_id?: number | null;
    item_title?: string | null;
    item_price?: number | null;
    message?: string | null;
    owner_response_message?: string | null;
    offer_price?: number | null;
    quantity?: number | null;
    created_at?: string | null;
    response?: boolean | null;
    is_seller_reviewed?: boolean;
    is_item_reviewed?: boolean;
    buyer?: any;
    seller?: any;
    buyer_id?: number | null;
    seller_id?: number | null;
    buyer_username?: string | null;
    seller_username?: string | null;
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

const getSellerName = (req: PendingRequest) => req.seller_username ?? null;

const isOutgoing = (req: PendingRequest) => {
    const currentUserId = loggedUser.id;
    if (!currentUserId) return false;

    const buyerId =
        req.buyer_id ??
        (req.buyer && typeof req.buyer === 'object' ? req.buyer.id : undefined) ??
        (typeof req.buyer === 'number' ? req.buyer : undefined);

    if (buyerId != null) return buyerId === currentUserId;
    if (req.buyer_username && loggedUser.username) return req.buyer_username === loggedUser.username;

    return false;
};

const isFullyReviewed = (req: PendingRequest) =>
    Boolean(req.is_seller_reviewed) && Boolean(req.is_item_reviewed);

let loading = $state(true);
let error = $state<string | null>(null);
let requests = $state<PendingRequest[]>([]);
let showCompleted = $state(false);

const fetchRequests = async () => {
    loading = true;
    error = null;

    if (!loggedUser.id) {
        error = 'You must be logged in to view your offers.';
        loading = false;
        return;
    }

    try {
        const res = await apiCaller.get<PendingRequest[]>('/pendingrequests/myoffers/');
        requests = (res.data ?? []) as PendingRequest[];
    } catch (e: any) {
        console.error('Failed to fetch outgoing offers', e);
        const data = e?.response?.data;
        if (data) {
            error =
                data.detail ||
                (typeof data === 'string' ? data : JSON.stringify(data));
        } else {
            error = 'Failed to load outgoing offers.';
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
    <div class="flex items-center justify-between gap-4 mb-4">
        <h1 class="text-3xl font-semibold">My Offers</h1>
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
        {@const outgoing = [...requests.filter(isOutgoing)].sort(
            (a, b) => (new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        )}

        {@const pendingOffers = outgoing.filter((req) => req.response == null)}
        {@const awaitingReviewOffers = outgoing.filter(
            (req) => req.response === true && !isFullyReviewed(req)
        )}
        {@const completedOffers = outgoing.filter(
            (req) => req.response === true && isFullyReviewed(req)
        )}
        {@const rejectedOffers = outgoing.filter((req) => req.response === false)}

        {#if outgoing.length === 0}
            <div class="text-center py-20">
                <p class="text-lg">No outgoing offers yet.</p>
                <p class="text-sm text-surface-500">Make an offer on a listing to see it here.</p>
            </div>
        {:else}
            {@const sections = [
                { title: 'Pending Offers', offers: pendingOffers },
                { title: 'Awaiting Review', offers: awaitingReviewOffers }
            ]}

            <div class="space-y-8">
                {#each sections as section}
                    <section>
                        <div class="flex items-center justify-between mb-2">
                            <h2 class="text-xl font-semibold">{section.title}</h2>
                            <span class="text-sm text-surface-500">{section.offers.length}</span>
                        </div>

                        {#if section.offers.length === 0}
                            <div class="text-sm text-surface-500 border border-surface-200 rounded p-4">
                                No offers in this section.
                            </div>
                        {:else}
                            <div class="overflow-x-auto border border-surface-200 rounded">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="text-xs uppercase text-surface-500 border-b border-surface-200">
                                            <th scope="col" class="py-2 px-3">Item</th>
                                            <th scope="col" class="py-2 px-3">To</th>
                                            <th scope="col" class="py-2 px-3">Quantity</th>
                                            <th scope="col" class="py-2 px-3">Offer</th>
                                            <th scope="col" class="py-2 px-3">Message</th>
                                            <th scope="col" class="py-2 px-3">Created</th>
                                            <th scope="col" class="py-2 px-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each section.offers as req (req.id)}
                                            {@const itemInfo = getItemInfo(req)}
                                            {@const sellerName = getSellerName(req)}

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
                                                <td class="py-2 px-3">{sellerName ?? '-'}</td>
                                                <td class="py-2 px-3">{req.quantity ?? '-'}</td>
                                                <td class="py-2 px-3">
                                                    {formatCurrency(req.offer_price ?? itemInfo.price)}
                                                </td>
                                                <td class="py-2 px-3 break-words max-w-xs">
                                                    {req.owner_response_message ?? req.message ?? '-'}
                                                </td>
                                                <td class="py-2 px-3 whitespace-nowrap">{formatDate(req.created_at)}</td>
                                                <td class="py-2 px-3">
                                                    <span class={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(req)}`}>
                                                        {getStatus(req)}
                                                    </span>

                                                    {#if req.response === true}
                                                        {#if req.is_seller_reviewed && req.is_item_reviewed}
                                                            <div class="text-xs text-surface-500 mt-2">✓ All reviews completed</div>
                                                        {:else}
                                                            <div class="flex flex-col gap-1 mt-2">
                                                                <div class="flex gap-2">
                                                                    {#if !req.is_seller_reviewed}
                                                                        <ReviewPopUp
                                                                            about="user"
                                                                            reference={sellerName ?? 'Unknown user'}
                                                                            revid={req.id}
                                                                            message="Review user"
                                                                            closeCallback={fetchRequests}
                                                                        />
                                                                    {/if}
                                                                    {#if !req.is_item_reviewed}
                                                                        <ReviewPopUp
                                                                            about="item"
                                                                            reference={itemInfo.title ?? `Item #${itemInfo.itemId}`}
                                                                            revid={req.id}
                                                                            message="Review item"
                                                                            closeCallback={fetchRequests}
                                                                        />
                                                                    {/if}
                                                                </div>
                                                                <div class="flex gap-2 text-xs text-surface-500">
                                                                    {#if req.is_seller_reviewed}<span>✓ User reviewed</span>{/if}
                                                                    {#if req.is_item_reviewed}<span>✓ Item reviewed</span>{/if}
                                                                </div>
                                                            </div>
                                                        {/if}
                                                    {/if}
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </section>
                {/each}

                <section>
                    <div class="flex items-center justify-between mb-2">
                        <button
                            class="flex items-center gap-2 text-xl font-semibold"
                            onclick={() => (showCompleted = !showCompleted)}
                        >
                            <span>Completed Offers</span>
                            <span class="text-base">{showCompleted ? '▾' : '▸'}</span>
                        </button>
                        <span class="text-sm text-surface-500">{completedOffers.length}</span>
                    </div>

                    {#if showCompleted}
                        {#if completedOffers.length === 0}
                            <div class="text-sm text-surface-500 border border-surface-200 rounded p-4">
                                No offers in this section.
                            </div>
                        {:else}
                            <div class="overflow-x-auto border border-surface-200 rounded">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="text-xs uppercase text-surface-500 border-b border-surface-200">
                                            <th scope="col" class="py-2 px-3">Item</th>
                                            <th scope="col" class="py-2 px-3">To</th>
                                            <th scope="col" class="py-2 px-3">Quantity</th>
                                            <th scope="col" class="py-2 px-3">Offer</th>
                                            <th scope="col" class="py-2 px-3">Message</th>
                                            <th scope="col" class="py-2 px-3">Created</th>
                                            <th scope="col" class="py-2 px-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each completedOffers as req (req.id)}
                                            {@const itemInfo = getItemInfo(req)}
                                            {@const sellerName = getSellerName(req)}

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
                                                <td class="py-2 px-3">{sellerName ?? '-'}</td>
                                                <td class="py-2 px-3">{req.quantity ?? '-'}</td>
                                                <td class="py-2 px-3">
                                                    {formatCurrency(req.offer_price ?? itemInfo.price)}
                                                </td>
                                                <td class="py-2 px-3 break-words max-w-xs">
                                                    {req.owner_response_message ?? req.message ?? '-'}
                                                </td>
                                                <td class="py-2 px-3 whitespace-nowrap">{formatDate(req.created_at)}</td>
                                                <td class="py-2 px-3">
                                                    <span class={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusClass(req)}`}>
                                                        {getStatus(req)}
                                                    </span>
                                                    <div class="text-xs text-surface-500 mt-2">✓ All reviews completed</div>
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
    {/if}
</div>
