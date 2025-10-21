<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	let { children } = $props();
	 import { CalendarIcon, CircleUserIcon, MenuIcon, SearchIcon } from '@lucide/svelte';
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
</script>


<AppBar>
  <AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
    <AppBar.Lead>
      <button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><MenuIcon /></button>
    </AppBar.Lead>
    <AppBar.Headline>
      <p class="text-3xl">Clippr</p>
    </AppBar.Headline>
    <AppBar.Trail>
		<LightSwitch></LightSwitch>
      <button type="button" class="btn-icon hover:preset-tonal"><CircleUserIcon class="size-6" /></button>
    </AppBar.Trail>
  </AppBar.Toolbar>
</AppBar>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
