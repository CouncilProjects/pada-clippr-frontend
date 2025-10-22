<script lang="ts">
    import {loggedUser} from "$lib/universalReactivity/auth.svelte"
    import { goto } from "$app/navigation"
import { toaster } from "$lib/toast";
	

    $effect(()=>{
        if(loggedUser.username==null){
            queueMicrotask(()=>{
                toaster.error({
                    title:'Authentication error',
                    description:'Login to use the app'
                });
                
            });
            goto('/auth');
        }
    })
</script>