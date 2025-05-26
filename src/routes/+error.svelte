<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="mt-40 min-h-[calc(100vh-60vw)]">
<h1 class="text-[10rem] leading-42">{page.status}</h1>
{#if (page.status === 404) }
<p class="text-base mb-3">You seem to be looking for a page that doesn't exist</p>
<p class="text-base mb-3">Go back to the <a href="/">homepage</a> to learn more about Citizen's Arrest Network.</p>
{:else}
<p class="text-base">{page.error.message}</p>
{/if}

</div>