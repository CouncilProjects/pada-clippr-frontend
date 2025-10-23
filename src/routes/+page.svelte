<script lang="ts">
    import {loggedUser} from "$lib/universalReactivity/auth.svelte"
    import { goto } from "$app/navigation"
    import { toaster } from "$lib/toast";
	import apiCaller from "$lib/axiosConfig"; // what to use to make http requests
	

    $effect.pre(()=>{
        if(loggedUser.username==null){
            
            goto('/auth');
            queueMicrotask(()=>{
                toaster.error({
                    title:'Authentication error',
                    description:'Login to use the app'
                });
                
            });
        }
    })
</script>