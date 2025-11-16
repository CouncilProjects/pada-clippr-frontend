<script lang="ts">
	import {
		Facebook,
		Youtube,
		Instagram,
		MessageCircle,
		Twitter,
		Ghost,
		Linkedin,
		Pin
	} from '@lucide/svelte';

	const socials = [
		{ name: 'facebook', icon: Facebook }, // fallback (Lucide has no Facebook)
		{ name: 'youTube', icon: Youtube },
		{ name: 'instagram', icon: Instagram },
		{ name: 'whatsApp', icon: MessageCircle }, // closest match
		{ name: 'x', icon: Twitter },
		{ name: 'snapchat', icon: Ghost }, // closest match
		{ name: 'linkedIn', icon: Linkedin },
		{ name: 'pinterest', icon: Pin } // closest match
	];

	let { data } = $props();

	let visualSocial = $state(data.socials);

	let changes = $state(0);

	let resetKey = $state(0);

	const oninput = () => {
		changes = 1;
	};

	const discard = () => {
		changes = 0;
		visualSocial = data.socials;
		resetKey++; // this will allow/force the table to reset
	};

	
</script>

<div>
	<div class="table-wrap">
		<form>
			<table class="table caption-bottom">
				<caption class="pt-4">A list of socials for your shop</caption>
				<thead>
					<tr>
						<th>Social</th>
						<th>Symbol</th>
						<th>Link</th>
					</tr>
				</thead>
				{#key resetKey}
					<!--this here is a way to bind the dom to a key, when the key changes the dom gets entirly redrawn. -->
					<tbody class="[&>tr]:hover:preset-tonal-primary">
						{#each socials as row}
							<tr>
								<td>{row.name}</td>
								<td><row.icon size={20} /></td>
								<td>
									<input
										class="input"
										type="text"
										placeholder={visualSocial![row.name] ?? row.name}
										value={visualSocial![row.name] ?? ''}
										{oninput}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				{/key}
			</table>
			{#if changes}
				<button class="btn preset-filled-error-400-600" onclick={discard}>Discard changes</button>
				<button class="btn preset-filled-primary-600-400">Apply changes</button>
			{/if}
		</form>
	</div>
</div>
