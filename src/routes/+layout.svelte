<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	let { children } = $props();
	 import {CircleUserIcon, MenuIcon } from '@lucide/svelte';
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import {loggedUser} from "$lib/universalReactivity/auth.svelte"

  import {Toast} from "@skeletonlabs/skeleton-svelte"
  import {toaster} from "$lib/toast"
</script>


<AppBar>
  <AppBar.Toolbar class="grid-cols-[auto_1fr_auto] content-center">
    <AppBar.Lead>
      <button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><MenuIcon /></button>
    </AppBar.Lead>
    <AppBar.Headline>
      <p class="text-3xl">Clippr</p>
    </AppBar.Headline>
    <AppBar.Trail>
		  <LightSwitch></LightSwitch>
      <button type="button" class="btn-icon hover:preset-tonal"><CircleUserIcon class="size-8" /></button>
      {#if loggedUser.username!=null}
        <p class="text-base">{loggedUser.username}</p>
      {/if}
      
    </AppBar.Trail>
  </AppBar.Toolbar>
</AppBar>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}


<!--we create a singleton toaster here-->
<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast {toast}>
      <Toast.Message>
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{toast.description}</Toast.Description>
      </Toast.Message>
      <Toast.CloseTrigger />
    </Toast>
  {/snippet}
</Toast.Group>