<script lang="ts">
    import apiCaller from "$lib/axiosConfig";
    import { XIcon } from "@lucide/svelte";
    import { Popover, Portal, RatingGroup } from "@skeletonlabs/skeleton-svelte";
    import { error } from "@sveltejs/kit";
    import Page from "../../routes/+page.svelte";

    let {about, reference, revid, message="Default",closeCallback} = $props();

    async function postReview(e:HTMLFormElement){
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        let body:any={};
        body["rating"]=formData.get("rating");
        body["about"]=about;
        body["comment"]=formData.get("comment");
        body["offer"]=revid;

        try {
            const postResult = await apiCaller.post("review/create/",body);
            if(postResult.status==201){
                closeCallback();
            }
        } catch (error) {
            console.error(error);
        }
        
    }

    async function testpostReview(e:HTMLFormElement){
        e.preventDefault();

       setTimeout(()=>{
        isOpen=false;
        closeCallback();
       },3000);
        
    }

    let isOpen = $state(false);
</script>

<!--NOTE, i use the onOpenChange to capture the internal component events.-->
<Popover open={isOpen} onOpenChange={(e)=>{isOpen=e.open}}>
	<Popover.Trigger class="btn preset-filled">{message}</Popover.Trigger>
	<Portal>
		<Popover.Positioner>
			<Popover.Content class="card w-96 p-4 bg-surface-100-900 shadow-xl">
				<div class="space-y-4">
					<header class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
						
						<div>
							<Popover.Title class="text-lg font-bold">Review</Popover.Title>
							<a href="https://bsky.app/profile/skeleton.dev" target="_blank" class="anchor">@skeletonlabs.dev</a>
						</div>
						<Popover.CloseTrigger class="btn-icon hover:preset-tonal self-start">
							<XIcon class="size-4" />
						</Popover.CloseTrigger>
					</header>
					<Popover.Description>Leave a review for {about} {reference}</Popover.Description>

                    <form onsubmit={testpostReview}>
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
                        <button class="btn preset-filled" type="submit">Submit</button>
                    </form>
                    
				</div>
				<Popover.Arrow class="[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]">
					<Popover.ArrowTip />
				</Popover.Arrow>
			</Popover.Content>
		</Popover.Positioner>
	</Portal>
</Popover>