<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	let { children } = $props();
	 import {CircleUserIcon, MenuIcon,Euro } from '@lucide/svelte';
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import {loggedUser} from "$lib/universalReactivity/auth.svelte"

  import {Toast} from "@skeletonlabs/skeleton-svelte"
  import {toaster} from "$lib/toast"

  import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

  let hovered = $state(false);
  const mouseTrack=()=>{
    hovered=!hovered;
  }

  const onclick=()=>{
    goto('/');
  }

  const lastLogIn = localStorage.getItem('lastLogin');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen grid grid-rows-[auto_1fr_auto]">
	<!-- Header -->
	<AppBar>
    <AppBar.Toolbar class="grid-cols-[auto_1fr_auto] content-center">
      <AppBar.Lead>
        <button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><MenuIcon /></button>
        
      </AppBar.Lead>
      <AppBar.Headline class="flex flex-row items-center">
        <button onmouseenter={mouseTrack} onmouseleave={mouseTrack} {onclick}>
          {#if hovered}
            <p class=" text-base md:text-3xl" in:fade>Clipp€r</p>
          {:else}
            <p class=" text-base md:text-3xl" in:fade>Clippr</p>
          {/if}
        </button>
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

	<!-- Main -->
	<main class="p-4 space-y-4">
		{@render children?.()}
	</main>
	<!-- Footer -->
	<footer class="bg-surface-300-700 p-4 ">
    {#if lastLogIn}
      <p>Last Login : {lastLogIn}</p>
    {/if}
    <p class="text-right">2025</p>
  </footer>
</div>

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