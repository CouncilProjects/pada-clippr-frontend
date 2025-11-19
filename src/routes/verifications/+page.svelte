<script lang="ts">
	import apiCaller from '$lib/axiosConfig';
	import { Progress } from '@skeletonlabs/skeleton-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let clone = $state(data.accounts);

	let query = $state('');

	let loading = $state(false);

    let lastSearch = '';

	async function submitVerify(e: Event, id: any) {
		try {
			const { data } = await apiCaller.post(`/user/${id}/verify/`);
			clone = clone.filter((elem: any) => elem.id != id);
		} catch (error) {
			console.log('I am not payed: verifications:page.svelte');
		}
	}

	async function searchQ() {
        const trimmed = query.trim();
		if (!trimmed) {
			return;
		}
        if(trimmed==lastSearch){
            return;
        }

		loading = true;
		try {
			const { data } = await apiCaller.get('/user/unverified/', { params: { q: trimmed } });
			clone = data;
            lastSearch=trimmed;
		} catch (error) {
			console.error('Error in request');
		} finally {
            
		    loading = false;
        }
        
	}
</script>

<div class="flex flex-col">
	<div class="flex flex-row max-w-100 self-center">
		<label class="label">
			<span class="label-text">Search</span>
			<span class="flex flex-row">
				<input class="input mr-2" type="text" bind:value={query} placeholder="Query username" onkeydown={(e)=>{if(e.key=='Enter' && loading==false) searchQ();}}/>
				<button class="btn preset-filled-primary-500 relative" disabled={loading} onclick={searchQ}>
					Submit
					{#if loading}
						<Progress class="items-center w-fit" value={null}>
							<Progress.Circle style="--size: 1.25rem; --thickness: 6px;">
								<Progress.CircleTrack />
								<Progress.CircleRange />
							</Progress.Circle>
							<Progress.ValueText />
						</Progress>
					{/if}
				</button>
			</span>
		</label>
	</div>
	<div class="table-wrapper">
		<table class="table">
			<thead>
				<tr>
					<th>Shop</th>
					<th>First name</th>
					<th>Last name</th>
					<th>Verify</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:bg-primary-400/20">
				{#each clone as row}
					<tr>
						<td>{row.username}</td>
						<td>{row.first_name}</td>
						<td>{row.last_name}</td>
						<td
							><button
								class="btn preset-outlined-secondary-400-600 hover:preset-tonal-secondary"
								onclick={(e) => {
									submitVerify(e, row.id);
								}}>Verify</button
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
        {#if clone.length==0}
            <span>No results...</span>
        {/if}
	</div>
</div>
