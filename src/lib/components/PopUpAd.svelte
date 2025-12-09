<script lang="ts">
	import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
    import { XIcon } from '@lucide/svelte';

    let {open,close}=$props();
	let timeTillClose = $state(5);

    const onclick=()=>{close();}

	const intId = setInterval(()=>{timeTillClose--; if(timeTillClose==0){clearInterval(intId)}},1000);
</script>


<Popover open={open} modal={true}>
	<Portal>
		<Popover.Positioner class="fixed inset-0 flex items-center justify-center z-20! bg-surface-300/50">
			<Popover.Content class="card p-3 preset-filled-surface-200-800 w-[40%] h-[30%] flex flex-row" >
				
					<span class="flex-9">AD SPACE</span>

				{#if timeTillClose<=0}
					<Popover.CloseTrigger {onclick} class="btn-icon hover:bg-red-400 self-start">
						<XIcon class="size-4" />
					</Popover.CloseTrigger>
				{:else}
					<span class="self-start">Skip in {timeTillClose}</span>
				{/if}
				
			</Popover.Content>
		</Popover.Positioner>
	</Portal>
</Popover>