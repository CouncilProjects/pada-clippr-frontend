<script lang="ts">
    import apiCaller from "$lib/axiosConfig";
    import { XIcon } from "@lucide/svelte";
    import { Popover, Portal, RatingGroup, Progress } from "@skeletonlabs/skeleton-svelte";
    import { error } from "@sveltejs/kit";
    import Page from "../../routes/+page.svelte";
    import axios from "axios";
    import PopUpAd from "./PopUpAd.svelte";

    let {about, reference, revid, message="Default",closeCallback,trigger_class=""} = $props();
    let loading = $state(false);
    let requesterror = $state("");
    const setError = (er:string)=>{
        requesterror=er;
        setTimeout(()=>{
            requesterror='';
        },3000);
    }
    let throttleID:any;
    const toogle=()=>{
        if(throttleID!=null) {clearTimeout(throttleID); throttleID=null; loading=false; return;}

        
            throttleID = setTimeout(()=>{
            loading=true;
        },300);
        
    }

    async function postReview(e:SubmitEvent){
        e.preventDefault();

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        let body:any={};
        body["rating"]=formData.get("rating");
        body["about"]=about;
        body["comment"]=formData.get("comment");
        body["offer"]=revid;

        try {
            toogle();
            const postResult = await apiCaller.post("review/create/",body);
            setTimeout(()=>{
                toogle();
            },Math.random()*1000);
            if(postResult.status==201){
                closeCallback();
            }
        } catch (error) {
            if(axios.isAxiosError(error)){
                if(error.response){
                    if(error.status==400){
                        
                        const errorData = error.response.data;
                        const key = Object.keys(errorData)[0];
                        console.error(`Key error : ${key}`)
                        setError((errorData[key] as string[]).join('\n'));
                    }
                }
            }
            
            setTimeout(()=>{
                toogle();
            },Math.random()*5000);
        }
        
    }
    let isOpen = $state(false);
</script>


<!--
@component  
When you render the component a button will appear. Pressing the button will open a review popup.

**Arguments:**

- **about** → Whether the review is for the item or the seller
- **reference** → The name of the item or seller
- **revid** → The ID of the corresponding offer
- **message** → What the button (trigger) will display
- **closeCallback** → A function called after a review is successfully created
- **trigger_class** → Tailwind classes you want applied to the button

**Example usage:**
    ```svelte 
    <ReviewPopUp about={"item"} reference={offer.item} revid={offer.id} message="Review item" closeCallback={() => { markReviewed(args) }}/>


-->


<!--NOTE, i use the onOpenChange to capture the internal component events.-->
<Popover open={isOpen} onOpenChange={(e)=>{isOpen=e.open}} closeOnInteractOutside={!loading}>
	<Popover.Trigger class={`btn preset-filled ${trigger_class}`}>{message}</Popover.Trigger>
	<Portal>
		<Popover.Positioner>
			<Popover.Content class="card w-96 p-4 bg-surface-100-900 shadow-xl">
				<div class="space-y-4">
					<header class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
						
						<div>
							<Popover.Title class="text-lg font-bold">Review</Popover.Title>
						</div>
						<Popover.CloseTrigger class="btn-icon hover:preset-tonal self-start {loading&&'hidden'}">
							<XIcon class="size-4" />
						</Popover.CloseTrigger>
					</header>
					<Popover.Description>Leave a review for {about} {reference}</Popover.Description>

                    <form onsubmit={postReview}>
                        <label class="label">
                            <span class="label-text">Rate it</span>
                            <RatingGroup name="rating" count={5} allowHalf={true}>
                                <RatingGroup.Control>
                                    <RatingGroup.Context>
                                        {#snippet children(ratingGroup)}
                                            {#each ratingGroup().items as index (index)}
                                                <RatingGroup.Item {index} />
                                            {/each}
                                        {/snippet}
                                    </RatingGroup.Context>
                                </RatingGroup.Control>
                                <RatingGroup.HiddenInput />
                            </RatingGroup>
                        </label>
                        <label class="label">
                            <span class="label-text">Leave comment</span>
                            <textarea name="comment" class="textarea rounded-container" rows="4" placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                            ></textarea>
                        </label>
                        {#if !loading}
                            <button class="btn preset-filled" type="submit" disabled={loading}>Submit Review</button>
                        {:else}
                            <Progress value={null} class="items-center w-fit">
		<Progress.Label>Progress</Progress.Label>
		<Progress.Circle>
			<Progress.CircleTrack />
			<Progress.CircleRange />
		</Progress.Circle>
		<Progress.ValueText />
	</Progress>
                        {/if}
                    </form>
                    {#if requesterror.length>0}
                        <span class="text-error-400-600">{requesterror}</span>
                    {/if}
				</div>
				<Popover.Arrow class="[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]">
					<Popover.ArrowTip />
				</Popover.Arrow>
			</Popover.Content>
		</Popover.Positioner>
	</Portal>
</Popover>