<script lang="ts">
  import { loggedUser } from "$lib/universalReactivity/auth.svelte"
  import { goto } from "$app/navigation"
  import { toaster } from "$lib/toast";
  import apiCaller, { refreshLogic } from "$lib/axiosConfig";
  import { onMount } from "svelte";
    import ReviewPopUp from "$lib/components/ReviewPopUp.svelte";

	type Offer = {
		item: string;
		seller: string;
		status: 'accepted' | 'rejected';
		itemReviewed: boolean;
		sellerReviewed: boolean;
    id:string
	};

	let offers: Offer[] = [
		{
      id:"12",
			item: 'MacBook Pro 14"',
			seller: 'Alice Johnson',
			status: 'accepted',
			itemReviewed: true,
			sellerReviewed: true
		},
		{
      id:"13",
			item: 'Gaming Chair',
			seller: 'Mark Stevens',
			status: 'rejected',
			itemReviewed: false,
			sellerReviewed: false
		},
		{
      id:"14",
			item: 'iPhone 13',
			seller: 'Sarah Lee',
			status: 'accepted',
			itemReviewed: true,
			sellerReviewed: false
		},
		{
      id:"15",
			item: 'Mechanical Keyboard',
			seller: 'Daniel Wu',
			status: 'rejected',
			itemReviewed: false,
			sellerReviewed: true
		},
		{
      id:"16",
			item: '4K Monitor',
			seller: 'Emily Clark',
			status: 'accepted',
			itemReviewed: false,
			sellerReviewed: false
		}
	];

  const toogle=(id:number,type:number)=>{
    //normally this ould be ID based, b=for now lets do incex based.
    if(type==0){
      offers[id].itemReviewed=true;
    } else {
      offers[id].sellerReviewed=true;
    }
    
  }
</script>

<div class="grid gap-4 md:grid-cols-2">
	{#each offers as offer,index}
		<div class="card preset-filled-tertiary-400-600 p-4 rounded-xl opacity-70 shadow-md" >
			<div class="flex justify-between items-start mb-2">
				<h3 class="text-lg font-semibold">{offer.item}</h3>

				<div
					color={offer.status === 'accepted' ? 'success' : 'error'}
				>
					{offer.status}
      </div>
			</div>

			<p class="text-sm text-surface-500 mb-3">
				Seller: <span class="font-medium">{offer.seller}</span>
			</p>
      <div>
        {#if !offer.itemReviewed}
          <ReviewPopUp about={"item"} reference={offer.item} revid={offer.id} message="Review item" closeCallback={()=>{toogle(index,0)}}></ReviewPopUp>
        {/if}
        {#if !offer.sellerReviewed}
          <ReviewPopUp about={"seller"} reference={offer.seller} revid={offer.id} message="review seller" closeCallback={()=>{toogle(index,1)}}></ReviewPopUp>
        {/if}
      </div>
		</div>
	{/each}
</div>