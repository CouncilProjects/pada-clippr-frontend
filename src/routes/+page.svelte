<script lang="ts">
    import {loggedUser} from "$lib/universalReactivity/auth.svelte"
    import { goto } from "$app/navigation"
    import { toaster } from "$lib/toast";
	import apiCaller,{refreshLogic} from "$lib/axiosConfig"; // what to use to make http requests
	import { onMount } from "svelte";
	
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
</script>