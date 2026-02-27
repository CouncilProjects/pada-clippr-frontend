<script lang="ts">
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  import { ArrowRight,CircleQuestionMark,SearchIcon, CircleUserIcon, MenuIcon, LogOutIcon, House, Store, Handshake, Inbox, Settings, Share2, ChartColumnBig, MessageCircleWarning, ShieldCheck,ScanSearch } from '@lucide/svelte';
  import { AppBar, Avatar, Dialog, Navigation, TagsInput } from '@skeletonlabs/skeleton-svelte';
  import { locale, loggedUser, logoutUser, toogleLocale } from "$lib/universalReactivity/auth.svelte"
  import gr from '$lib/assets/gr.svg';
  import en from '$lib/assets/en.svg';

  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
  import { loadLocale } from 'wuchale/load-utils'

  import apiCaller, { backend} from '$lib/axiosConfig';
    import { md, sm } from '$lib/universalReactivity/screenSizes';
    import { toaster } from '$lib/toast';

  // tracks when the site title is hovered and onclick sends the user home
  let hovered = $state(false);
  const mouseTrack=()=>{
    hovered=!hovered;
  }

  let expanded = $state(JSON.parse(localStorage.getItem(`clippr-${loggedUser.id}-expand-search`) || 'false'));
  let openHint = $state(false);

  const toogleExpanded = ()=>{
    expanded=!expanded;
    localStorage.setItem(`clippr-${loggedUser.id}-expand-search`,expanded);
  
    toaster.info({title:expanded ? "Search expanded" : "Disabled expanded search",duration:1500})
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
        { label: 'My Clippings', href: '/my-clippings', icon: Store },
        { label: 'Intrest Offers', href: '#', icon: Inbox },
        { label: 'My Offers', href: '#', icon: Handshake },
    ],
    SELLER:[
      { label: 'My Clippings', href: '/my-clippings', icon: Store },
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
      logoutUser();
      goto("/auth");
    } catch (error) {
      console.error(error);
    }
  }
  let avatar = $derived(loggedUser.avatar ? backend + loggedUser.avatar : null);

  function doSearch(e: SubmitEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("q")?.toString() ?? "";
    const tags = formData.get("t")?.toString().replaceAll(" ", "") ?? "";
    if (!query.trim() && !tags) return;

    goto(`/search?q=${encodeURIComponent(query)}&t=${encodeURIComponent(tags)}&e=${encodeURIComponent(expanded)}`);
  }

  let icon = $state((localStorage.getItem("clippr-locale")||'en')=='en'?en:gr);

  async function changeLocal(){
    let loc = localStorage.getItem("clippr-locale")
    if(loc=="gr"){
      loc = 'en';
      icon=en;
    } else {
      loc = 'gr';
      icon=gr;
    }

    localStorage.setItem("clippr-locale",loc);
    await loadLocale(loc);
  }

  let smSearch : boolean = $state(false);
  let appBarRef : HTMLElement|undefined = $state();
</script>


<Dialog open={openHint} modal={true} onInteractOutside={()=>{openHint=false}}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/50" />
		<Dialog.Positioner class="fixed z-10 flex inset-0 justify-center items-center">
			<Dialog.Content class="card p-3 preset-filled-surface-200-800 shadow-primary-300-700 shadow-2xs max-w-100">
				<Dialog.Title class="text-center text-2xl">How our search works</Dialog.Title>
				<Dialog.Description>
          <div class="flex flex-col items-center max-h-100 overflow-y-auto">
              <p class="flex flex-col">
                <span class="h5 text-center">Typing multiple words</span>
                <span>Our algorithm will try to find clippings that have atleast one of the words</span>
                <span>superman t-shirt large <ArrowRight class="inline" color="green"></ArrowRight> superman <span class="text-green-500">OR</span> t-shirt <span class="text-green-500">OR</span> large</span>
                <span>
                  The above will match posts like <span class="text-green-500">Superman</span> figuine, old <span class="text-green-500">t-shirt</span>, <span class="text-green-500">large</span> poster
                </span>
              </p>
              <hr class="hr mt-1 mb-1 border-primary-500" />
              <p class="flex flex-col">
                <span class="h5 text-center">How to keep word ordering</span>
                <span>Our algorithm will <span class="underline">NOT</span> process any group of words surrounded with <kbd class="kbd">""</kbd></span>
                <span>metal "t-shirt large"<ArrowRight class="inline" color="green"></ArrowRight> metal <span class="text-green-500">OR</span> t-shirt large</span>
                <span>
                  The above will match posts like <span class="text-green-500">t-shirt large</span>, <span class="text-green-500">metal t-shirt large</span>, disneyland <span class="text-green-500">t-shirt large</span>
                </span>
                <span>
                  It will not match clippings like, <span class="text-red-500" > movie t-shirt, large mirror, large tony t-shirt</span>
                </span>
              </p>
             <hr class="hr mt-1 mb-1 border-primary-500" />
              <p class="flex flex-col">
                <span class="h5 text-center">Expand search</span>
                <span>Our algorithm by default checks clipping titles to find results. But there are more places of information like descriptions and tags.</span>
                <span>By clicking the button <ScanSearch class="inline bg-primary-500"></ScanSearch> next to the search you can enable expanded search</span>
                <span>
                  While expanded search is enabled, our algorithm will search in the clippings titles, but also in the desrciptions and tags to find matches.
                </span>
              </p>
            </div>
          </Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>


<!--
because the appbar through sticky and blurs etc was creating different stacking contexts. the popover could not go above it no matter how high the z was.
since the popover uses a portal, we can simple have it render outside the appbar DOM tree. 
we will make bellow a div that has a z higher than the appbar, and get its reference, then in the portal of the popover we put the target. 
the coneten will now render inside this div and not the appbar. 
-->
<div bind:this={appBarRef} class="fixed z-100"></div>

<AppBar  class="sticky top-0 z-9 bg-surface-100-900/80 backdrop-blur-sm"> <!--NOTE: in skeleton ui the /80 means 80% transparency grid-cols-[auto_1fr_auto] content-center-->
    
    <AppBar.Toolbar class="grid grid-cols-[auto_1fr] grid-rows-2 md:grid-cols-[auto_1fr_auto] md:grid-rows-1">
      <AppBar.Lead class="mr-1">
        {#if loggedUser.accountType!=null}
          <Popover>
            <Popover.Trigger class="btn" data-testid="side_menu_button"><MenuIcon></MenuIcon></Popover.Trigger>
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
                          <div class="block sm:hidden flex-col space-y-2">
                            <LightSwitch></LightSwitch>
                            <button class="btn btn-icon w-8 h-8" aria-label="Change Language" onclick={changeLocal}><img src={icon} alt={"change lang"}></button>
                          </div>
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
        <div class="pr-10">
          <button onmouseenter={mouseTrack} onmouseleave={mouseTrack} {onclick}>
            {#if hovered}
              <p class=" text-base md:text-3xl" in:fade>Clipp€r</p>
            {:else}
              <p class=" text-base md:text-3xl" in:fade>Clippr</p>
            {/if}
          </button>
        </div>

        <button class="btn icon-btn" onclick={()=>{openHint=!openHint}}>
          <CircleQuestionMark></CircleQuestionMark>
        </button>
        {#if md.current}
          <form onsubmit={doSearch} class="input-group grid-cols-[auto_1fr_auto_auto]">
            <div class="ig-cell preset-tonal">
              <SearchIcon size={16} />
            </div>
            <input class="ig-input" type="search" placeholder="Search..." name="q" autocomplete="off" />
            <TagsInput validate={(d) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.inputValue)} editable={false}>
              <TagsInput.Control>
                <TagsInput.Context>
                  {#snippet children(tagsInput)}
                    {#each tagsInput().value as value, index (index)}
                      <TagsInput.Item {value} {index}>
                        <TagsInput.ItemPreview>
                          <TagsInput.ItemText>{value}</TagsInput.ItemText>
                          <TagsInput.ItemDeleteTrigger />
                        </TagsInput.ItemPreview>
                        <TagsInput.ItemInput />
                      </TagsInput.Item>
                    {/each}
                  {/snippet}
                </TagsInput.Context>
                <TagsInput.Input placeholder="Add a tag..." />
              </TagsInput.Control>
              <TagsInput.HiddenInput name="t" />
            </TagsInput>
            <button class="ig-btn preset-filled">Submit</button>
          </form>
        {:else}
          <Popover onOpenChange={(e)=>{smSearch=e.open}}>
            <Popover.Trigger class="btn btn-icon" ><SearchIcon class={['hover:bg-primary-50',smSearch&&'text-green-500']}></SearchIcon></Popover.Trigger>
            <Portal target={appBarRef}>
              <Popover.Positioner class="fixed z-999">
                <Popover.Content class="card preset-filled-surface-600-400 p-2 flex flex-col">

                  <form onsubmit={doSearch} class="flex flex-col">
                    <input class="ig-input" type="search" placeholder="Search..." name="q" autocomplete="off" />
                    <button class="ig-btn preset-filled w-fit self-center rounded-2xl">Submit</button>
                  </form>
                  <Popover.Arrow class="[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]">
					<Popover.ArrowTip />
				</Popover.Arrow>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover>
        {/if}
        

        
          <button class="btn btn-icon ml-1 {expanded ? 'preset-filled-primary-300-700' : 'preset-outlined-primary-300-700'} hover:preset-tonal-primary" onclick={toogleExpanded}>
            <ScanSearch size="30"></ScanSearch>
          </button>
          
      </AppBar.Headline>

      
        <AppBar.Trail class={["items-center justify-center col-span-2 sm:col-span-1"]}>
          <div class={['hidden md:flex md:flex-row items-center justify-center',!loggedUser.username&&"flex! flex-row"]}>
            
            <LightSwitch />
            
            <button class="btn btn-icon w-12 h-8" aria-label="Change Language" onclick={changeLocal}><img class="w-full h-full object-cover" src={icon} alt={"change lang"}></button>
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

