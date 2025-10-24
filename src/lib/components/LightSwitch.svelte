<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import { MoonIcon, SunIcon } from '@lucide/svelte';

  let checked = $state(false);

  let mode;
  $effect(() => {
    mode = localStorage.getItem('mode') || 'light';
    checked = mode === 'dark';
    document.documentElement.setAttribute('data-mode', mode);
  });

  const onCheckedChange = (event: { checked: boolean }) => {
    mode = event.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);
    checked = event.checked;
  };
</script>

<Switch {checked} {onCheckedChange}>
  <Switch.Control>
    <Switch.Thumb class="bg-primary-100-900">
        <Switch.Context>
                {#snippet children(switch_)}
                {#if switch_().checked}
                    <MoonIcon class="size-3" />
                {:else}
                    <SunIcon class="size-3" />
                {/if}
                {/snippet}
      </Switch.Context>
    </Switch.Thumb>
  </Switch.Control>
  <Switch.Label class='text-base'>{checked?'Dark':'Light'}</Switch.Label>
  <Switch.HiddenInput />
</Switch>