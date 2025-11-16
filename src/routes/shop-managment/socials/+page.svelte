<script lang="ts">
	import {
		Facebook,
		Youtube,
		Instagram,
		MessageCircle,
		Twitter,
		Ghost,
		Linkedin,
		Pin,
		AtSign
	} from '@lucide/svelte';

	const socials = [
		{ name: 'email', icon: AtSign },
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
		resetKey++; // this will allow/force the table to reset
	};

	const submition = (e: SubmitEvent) => {
		e.preventDefault();
		const formdata = new FormData(e.currentTarget as HTMLFormElement);

		let newBaseline: Record<string, string> = {};
		socials.forEach((social) => {
			if (formdata.get(social.name) != '') {
				newBaseline[social.name] = formdata.get(social.name) as string;
			}
		});

		visualSocial = newBaseline;
		changes = 0;
		console.log(formdata);
	};
</script>

<div>
	<form onsubmit={submition}>
		<div class="table-wrap">
			<table class="table caption-bottom">
				<caption class="pt-4">A list of socials for your shop</caption>
				<thead>
					<tr>
						<th>Social</th>
						<th>Symbol</th>
						<th>Account</th>
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
										name={row.name}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				{/key}
			</table>
		</div>
		{#if changes}
			<button class="btn preset-filled-error-600-400 text-white" onclick={discard}>Discard changes</button>
			<button class="btn preset-filled-primary-600-400" type="submit">Apply changes</button>
		{/if}
	</form>
</div>
