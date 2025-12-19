<script lang="ts">
  import { loggedUser } from "$lib/universalReactivity/auth.svelte"
  import { goto } from "$app/navigation"
  import { toaster } from "$lib/toast";
  import apiCaller, { refreshLogic } from "$lib/axiosConfig";
  import { onMount } from "svelte";
</script>