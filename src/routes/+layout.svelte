<script lang="ts">
  import '../app.css';
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  let { children } = $props();
  import { CircleUserIcon, MenuIcon, LogOutIcon, House, Store, Handshake, Inbox, Settings, Share2, ChartColumnBig, MessageCircleWarning, ShieldCheck } from '@lucide/svelte';
  import { AppBar, Avatar, Navigation } from '@skeletonlabs/skeleton-svelte';
  import { loggedUser } from "$lib/universalReactivity/auth.svelte"

  import { Toast } from "@skeletonlabs/skeleton-svelte"
  import { toaster } from "$lib/toast"

  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

  import apiCaller, { backend, refreshLogic } from '$lib/axiosConfig';
	import { onMount } from 'svelte';

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
      { label: 'Shop Socials', href: '/shop-managment/socials', icon: Share2 },
    ],
    ADMIN:[
      { label: 'Site analytics', href: '#', icon: ChartColumnBig },
      { label: 'Reports', href: '#', icon: MessageCircleWarning },
      { label: 'Verification', href: '/verifications', icon: ShieldCheck },
    ],
  }

  // function to get nav links, if bad role is given it returns nothing
  function getNavLinks(role:string|null) {
    if(role==null) return [];
    return navLinksLookUpTable[role as Role];
  }

  const commonlinks=[
    { label: 'Home', href: '/', icon: House },
    { label: 'Settings', href: '/account-settings', icon: Settings },
  ]

  const currentUserLinks =$derived(
    [commonlinks[0],...getNavLinks(loggedUser.accountType),commonlinks[1]]
  );

  async function logoutSubmit(e: Event|null) {
    e?.preventDefault();
    try {
      await apiCaller.post("/user/logout/");
      loggedUser.accountType = null;
      loggedUser.token = null;
      loggedUser.username = null;
      goto("/auth");
    } catch (error) {
      console.log("Since when does the backend give an error here??");
    }
  }

     async function triggerRefresh(){
        try {
            const tok = await refreshLogic();
            console.log("i refreshed and gor a token");
            return tok;
        } catch (error) {
            return null
        }
    }

    
onMount(async () => {
    if (!loggedUser.username) {
        const newToken = await triggerRefresh();
        if (!newToken) {
            goto('/auth');
            toaster.error({
                title: 'Authentication error',
                description: 'Please login again'
            });
        } else {
            
        }
    }
});

  async function getAvatar(){
    try {
      const result=await apiCaller.get("/user/avatar");
      if(result.status==200){
        const {userAvatar} = result.data;
        if(userAvatar.length>0){
          loggedUser.avatar=userAvatar[0].image;

        }
      }
    } catch (error) {
      console.log("todo");
    }
  }

  $effect(()=>{
    if(loggedUser.token){
      getAvatar();
    }
  })

  let avatar = $derived(loggedUser.avatar ? backend + loggedUser.avatar : null);

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
      <AppBar.Trail class="items-center">
        <div class="hidden sm:block">
          <LightSwitch></LightSwitch>
        </div>
        
        {#if loggedUser.username!=null}
         
          {#if !avatar}
          <button type="button" class="btn-icon hover:preset-tonal"><CircleUserIcon size=18 /></button>
        {:else}
          <Avatar class="size-10 sm:size-18">
            <Avatar.Image src={avatar} alt="small" class="w-full h-full object-cover"/>
            <Avatar.Fallback>SK</Avatar.Fallback>
          </Avatar>
        {/if}
         <p class="text-base">{loggedUser.username}</p>
          <button type="button" class="btn-icon hover:preset-tonal" onclick={logoutSubmit}><LogOutIcon class="size-8" /></button>
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