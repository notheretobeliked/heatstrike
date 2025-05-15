<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$components/Button.svelte'
</script>

<div class="error-container bg-extremecaution">
	<div class="error-content flex flex-col gap-9 w-full max-w-[852px] mx-auto  py-48">
        
		{#if $page.status === 404}
            <h1 class=" text-extremedanger font-display !self-center !font-anton !fluid-text-xl !uppercase !text-center md:!px-14">404!</h1>
			<p>Sorry, we couldn't find the page you were looking for.</p>
		{:else}
			<h1>Error {$page.status}</h1>
			<p>{$page.error?.message || 'An unexpected error occurred'}</p>
		{/if}
        <Button label="Go to homepage" url="/" colourClass="bg-caution" />
		
	</div>
</div>
