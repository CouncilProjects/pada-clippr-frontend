<script lang="ts">
    //imports
    import '../app.css';
    import { loggedUser } from '$lib/universalReactivity/auth.svelte';
    import { Toast } from '@skeletonlabs/skeleton-svelte';
    import { toaster } from '$lib/toast';
    import { goto } from '$app/navigation';
    import apiCaller, { backend, refreshLogic } from '$lib/axiosConfig';
    import { onDestroy, onMount } from 'svelte';
    import getEventBus from '$lib/universalReactivity/eventBus';
    import PopUpAd from '$lib/components/PopUpAd.svelte';
    import MainAppBar from '$lib/components/MainAppBar.svelte';
    import {md} from "$lib/universalReactivity/screenSizes"
    import {ChevronsUp} from "@lucide/svelte"
    import { page } from '$app/state';

    //Reactive state
    let popUp = $state(false);
    const eventBus = getEventBus();
    let theScroll = $state(0);
    let showBackToTop = $derived(theScroll > 0 ? true : false);

    //Props
    let { children } = $props();

    //non reactive
    const lastLogIn = localStorage.getItem('lastLogin');

    //Event handlers
    const removeEventCb = eventBus.on('thumb-card-click', () => {
        console.log("Event called");
        const lastAd = localStorage.getItem(`clippr-last-ad-${loggedUser.id}`);
        const storedTime = lastAd ? parseInt(lastAd,10) : 0
        
        const currentTime = Date.now();
        const fiveMinInMs = 5 * 60 * 1000;
        
        if (lastAd == undefined || (currentTime - storedTime) > fiveMinInMs) {
            console.log("OKKKK??");
            showPopUp();
            localStorage.setItem(`clippr-last-popup-${loggedUser.id}`, Date.now().toString());
        }
    });

    //functions

    const showPopUp = () => {
        popUp = true;
    };

    const backToTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    async function triggerRefresh() {
        try {
            const tok = await refreshLogic();
            console.log('i refreshed and gor a token');
            return tok;
        } catch (error) {
            return null;
        }
    }

    async function getAvatar() {
        try {
            const result = await apiCaller.get('/user/avatar');
            if (result.status == 200) {
                const { userAvatar } = result.data;
                if (userAvatar.length > 0) {
                    loggedUser.avatar = userAvatar[0].image;
                }
            }
        } catch (error) {
            console.log('todo');
        }
    }
    onMount(async () => {
        if (!loggedUser.username) {
            const newToken = await triggerRefresh();
            if (!newToken && page.url.pathname!='/auth') {
                goto('/auth');
                toaster.error({
                    title: 'Authentication error',
                    description: 'Please login again'
                });
            } else {
            }
        }
    });

    //reruns any time the username changes
    $effect(() => {
        const userN = loggedUser.username;

        if(!userN) return;
        
        getAvatar();
    });

    onDestroy(() => {
        removeEventCb();
    });
</script>

<svelte:head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Clipp€r</title>
</svelte:head>

<svelte:window bind:scrollY={theScroll} />

{#if popUp}
    <PopUpAd
        open={true}
        close={() => {
            popUp = false;
        }}
    />
{/if}

{#if showBackToTop}
    <button
        class="btn preset-filled-primary-300-700 fixed m-2 !sm:left-5 bottom-5 md:right-5  z-99 rounded-full"
        onclick={backToTop}
    >
        {#if !md.current}
            <ChevronsUp></ChevronsUp>
        {:else}
            Back to Top
        {/if}
    </button>
{/if}
<div class="h-dvh grid grid-rows-[auto_1fr_auto]">
    <!--because the MainAppBar now had the portal div it needed to be wrapped so it could take the 1st auto-->
    <div class="z-1">
        <MainAppBar></MainAppBar>
    </div>

    <!-- Main -->
    <main class="p-4 space-y-4">
        {@render children?.()}
    </main>
    <!-- Footer -->
    <footer class="bg-surface-300-700 p-4 relative flex items-center justify-between bottom-0">
        {#if lastLogIn}
            <p>Last Login : {lastLogIn}</p>
        {/if}
        <div class="right-5 content-end">
            <p class="text-right">2025-{new Date().getFullYear()}</p>
            <a class="anchor text-right" href="/powered-by">Powered by</a>
        </div>
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

<!--
<style>

:root {
  /* Use an existing Skeleton CSS variable */
  --body-background-color: #e0f0e0;
}
</style>
-->
