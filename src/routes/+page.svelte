<script lang="ts">
    import {loggedUser} from "$lib/universalReactivity/auth.svelte"
    import { goto } from "$app/navigation"
    import { toaster } from "$lib/toast";
	import apiCaller,{refreshLogic} from "$lib/axiosConfig"; // what to use to make http requests
	import { onMount } from "svelte";
	
 
</script>