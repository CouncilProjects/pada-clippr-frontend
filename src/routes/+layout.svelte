<script lang="ts">
	import '../app.css';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	let { children } = $props();
	 import {CircleUserIcon, MenuIcon,House,Store,Handshake,Inbox,Settings,Share2,ChartColumnBig,MessageCircleWarning,ShieldCheck, Icon, Ribbon } from '@lucide/svelte';
  import { AppBar, Navigation } from '@skeletonlabs/skeleton-svelte';
  import {loggedUser} from "$lib/universalReactivity/auth.svelte"

  import {Toast} from "@skeletonlabs/skeleton-svelte"
  import {toaster} from "$lib/toast"

  import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
  import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

  // tracks when the site title is hovered and onclick sends the user home
  let hovered = $state(false);
  const mouseTrack=()=>{
    hovered=!hovered;
  }

  const onclick=()=>{
    goto('/');
  }

  //2 different kinds of clicable icons, chose what you like best
  let anchorRailComplex = 'btn hover:preset-outlined-primary-500 hover:bg-surface-500/30 aspect-square w-full max-w-[84px] flex flex-col items-center gap-0.5';
  let anchorRail = 'btn hover:preset-tonal aspect-square w-full max-w-[84px] flex flex-col items-center gap-0.5';
   
  //types for the nav links
  type Role = 'MEMBER'|'SELLER'|'ADMIN';
  type AccountLinks = Record<Role,{label:string,href:string,icon:any}[]>;

  const navLinksLookUpTable:AccountLinks ={
    MEMBER:[
        { label: 'My Clippings', href: '#', icon: Store },
        { label: 'Intrest Offers', href: '#', icon: Inbox },
        { label: 'My Offers', href: '#', icon: Handshake },
    ],
    SELLER:[
      { label: 'My Clippings', href: '#', icon: Store },
      { label: 'My analitics', href: '#', icon: ChartColumnBig },
      { label: 'Reviews', href: '#', icon: Inbox },
      { label: 'Shop Socials', href: '#', icon: Share2 },
    ],
    ADMIN:[
      { label: 'Site analytics', href: '#', icon: ChartColumnBig },
      { label: 'Reports', href: '#', icon: MessageCircleWarning },
      { label: 'Verification', href: '#', icon: ShieldCheck },
    ],
  }

  // function to get nav links, if bad role is given it returns nothing
  function getNavLinks(role:string|null) {
    if(role==null) return [];
    return navLinksLookUpTable[role as Role];
  }

  const commonlinks=[
    { label: 'Home', href: '/', icon: House },
    { label: 'Settings', href: '#', icon: Settings },
  ]

  const currentUserLinks =$derived(
    [commonlinks[0],...getNavLinks(loggedUser.accountType),commonlinks[1]]
  );

  
  //non reactive
  const lastLogIn = localStorage.getItem('lastLogin');
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <title>Clipp€r</title>
</svelte:head>

<div class="h-screen grid grid-rows-[auto_1fr_auto]">
	<!-- Header -->
	<AppBar class="sticky top-0 z-10 bg-surface-100-900/80 backdrop-blur-sm"> <!--NOTE: in skeleton ui the /80 means 80% transparency-->
    <AppBar.Toolbar class="grid-cols-[auto_1fr_auto] content-center">
      <AppBar.Lead>
        {#if loggedUser.accountType!=null}
          <Popover>
            <Popover.Trigger class="btn"><MenuIcon></MenuIcon></Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content class="card max-w-md mt-5 p-4 bg-surface-100-900 shadow-xl space-y-2 max-h-[70dvh] overflow-hidden">
                  <Popover.Title class="font-bold">Menu</Popover.Title>
                  <Popover.Description class="overflow-y-auto max-h-[60dvh] smooth-scroll"> 
                    <Navigation layout="rail">
                      <Navigation.Content>
                        <Navigation.Menu>
                          {#each currentUserLinks as link (link)}
                            {@const Icon = link.icon}
                            <a href={link.href} class={anchorRail}>
                              <Icon class="size-5" />
                              <span class="text-xs">{link.label}</span>
                            </a>
                          {/each}
                        </Navigation.Menu>
                      </Navigation.Content>
                    </Navigation>
                  </Popover.Description>
                  
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover>
        {/if}
        
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