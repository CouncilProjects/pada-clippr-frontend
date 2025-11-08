<script lang="ts">
    import {loggedUser} from "$lib/universalReactivity/auth.svelte"
    import { goto } from "$app/navigation"
    import { toaster } from "$lib/toast";
	import apiCaller,{refreshLogic} from "$lib/axiosConfig"; // what to use to make http requests
	
    async function triggerRefresh(){
        await refreshLogic();
        return;
    }

    $effect.pre(()=>{
        if(loggedUser.username==null){
            triggerRefresh();
            if(loggedUser.token==null){
                goto('/auth');
            }
            
            queueMicrotask(()=>{
                toaster.error({
                    title:'Authentication error',
                    description:'Login to use the app'
                });
                
            });
        }
    })
</script>