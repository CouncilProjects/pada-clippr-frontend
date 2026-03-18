
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
    message?: string | null;
    owner_response_message?: string | null;
    offer_price?: number | null;
    quantity?: number | null;
    created_at?: string | null;
    buyer?: any;
    seller?: any;
    buyer_username?: string | null;
    seller_username?: string | null;
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

let loading = $state(true);
let error = $state<string | null>(null);
let requests = $state<PendingRequest[]>([]);

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
    <h1 class="text-3xl font-semibold mb-4">My Offers</h1>

    {#if loading}
        <div class="flex flex-col items-center gap-3 py-20">
            <div class="spinner"></div>
            <span>Loading offers…</span>
        </div>
    {:else if error}
        <div class="text-center py-20 text-error-500">
            ⚠ {error}
        </div>
    {:else}
        {#if requests.filter(isOutgoing).length === 0}
            <div class="text-center py-20">
                <p class="text-lg">No outgoing offers yet.</p>
                <p class="text-sm text-surface-500">Make an offer on a listing to see it here.</p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-xs uppercase text-surface-500 border-b border-surface-200">
                            <th class="py-2 px-3">Item</th>
                            <th class="py-2 px-3">To</th>
                            <th class="py-2 px-3">Quantity</th>
                            <th class="py-2 px-3">Offer</th>
                            <th class="py-2 px-3">Message</th>
                            <th class="py-2 px-3">Created</th>
                            <th class="py-2 px-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each requests.filter(isOutgoing) as req}
                            {@const itemInfo = getItemInfo(req)}
                            {@const sellerName = getSellerName(req)}
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
                                <td class="py-2 px-3">{sellerName ?? '-'}</td>
                                <td class="py-2 px-3">{req.quantity ?? '-'}</td>
                                <td class="py-2 px-3">
                                    {#if req.offer_price != null}
                                        € {req.offer_price}
                                    {:else if itemInfo.price != null}
                                        € {itemInfo.price}
                                    {:else}
                                        -
                                    {/if}
                                </td>
                                <td class="py-2 px-3 break-words max-w-xs">{req.owner_response_message ?? req.message ?? '-'}</td>
                                <td class="py-2 px-3">{formatDate(req.created_at)}</td>
                                <td class="py-2 px-3">
                                    {#if req.response === null}
                                        Pending
                                    {:else if req.response === true}
                                        Accepted
                                        {#if req.is_seller_reviewed && req.is_item_reviewed}
                                            <span class="text-xs text-surface-500">
                                                ✓ All reviews completed
                                            </span>
                                        {:else}
                                            <div class="flex flex-col gap-1">
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
                                            </div>
                                            <div class="flex gap-2 text-xs text-surface-500 mt-2">
                                                {#if req.is_seller_reviewed}
                                                    <span>✓ User reviewed</span>
                                                {/if}
                                                {#if req.is_item_reviewed}
                                                    <span>✓ Item reviewed</span>
                                                {/if}
                                            </div>
                                        {/if}
                                    {:else}
                                        Rejected
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
</div>
