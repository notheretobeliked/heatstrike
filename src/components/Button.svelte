<script lang="ts">
	/*
    this is a generic button 
  */
	import { createEventDispatcher } from 'svelte'

	type variant = 'default' | 'wonky'
	export let label: string = 'Read more'
	export let url: string = '/'
	export let active: boolean = false
	export let textClass: string = 'text-base'
	export let colourClass: string = 'black' // Assuming this is a default style
	export let textColourClass: string = 'text-black' // Assuming this is a default style
	if (active) colourClass = 'bg-black text-white stroke-black'
	export let variant: variant = 'default'

	const dispatch = createEventDispatcher()

	function handleClick() {
		dispatch('clicked')
	}

	const words = label.split(' ')
</script>

{#if variant === 'default'}
	<a
		href={url}
		class="{colourClass} rounded-full transition-all duration-500 hover:bg-black hover:text-white hover:border-white py-2 px-4 border-black border {textClass} {textColourClass} font-display cursor-pointer"
		role="button"
	>
		{label}
	</a>
{:else}
	<a
		href={url}
		class="{textClass} {textColourClass} cursor-pointer block relative"
		role="button"
		on:click|preventDefault={handleClick}
	>
  {#if !active}
  <span class="block absolute right-3 -top-4 text-[2rem] font-sans">☼</span>
			{#each words as word, index}
				{#if index === 0}
					<span class="block font-medium text-xl">{word}</span>
				{:else}
					<span class={index === 1 ? 'block rotate-6 mr-3 font-medium text-xl' : 'font-medium text-xl'}>{word}</span>
				{/if}
			{/each}
		{/if}
		<svg
			class="w-12 h-12 transition-all {active && 'rotate-180'}"
			width="60"
			height="50"
			viewBox="0 0 60 50"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1.90487 0.0620723C0.801556 0.114612 -0.0502699 1.05162 0.00226604 2.15494C0.0548058 3.25826 0.991814 4.11008 2.09513 4.05755L1.90487 0.0620723ZM52.9782 46.7652C51.7705 38.6562 47.8067 26.6469 39.7735 16.8191C31.6822 6.92005 19.438 -0.772834 1.90487 0.0620723L2.09513 4.05755C18.162 3.29246 29.2511 10.2662 36.6765 19.3505C44.16 28.506 47.8962 39.7968 49.0218 47.3544L52.9782 46.7652Z"
				class="stroke-{colourClass} fill-{colourClass} fill-black"
			/>
			<path
				d="M57.5 36.5598L51 47.0598L40 42.5598"
				class="stroke-{colourClass}"
				stroke-width="4"
				stroke-linecap="round"
			/>
		</svg>
	</a>
{/if}

<style>
	.special-class {
		color: red; /* Example style for the second word */
		font-weight: bold;
	}
</style>
