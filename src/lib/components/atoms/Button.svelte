<script lang="ts">
	import { run, createBubbler, handlers } from 'svelte/legacy'
	import { createEventDispatcher } from 'svelte'

	const bubble = createBubbler()
	const dispatch = createEventDispatcher()

	interface Props {
		/*
    this is a generic button 
  */
		label?: string
		url?: string
		active?: boolean
		textClass?: string
		fullWidth?: boolean
		colourClass?: string // Assuming this is a default style
		textColourClass?: string // Assuming this is a default style
		shrink?: boolean // New prop to explicitly control shrinking behavior
		selfAlign?: string // New prop to control self-alignment in flex containers
		disabled?: boolean
		type?: 'button' | 'submit' | 'reset' | 'wonky'
		onclick?: (event: Event) => void
	}

	let {
		label = 'Read more',
		url = '/',
		active = false,
		textClass = 'text-sm uppercase text-center',
		fullWidth = false,
		colourClass = 'bg-black',
		textColourClass = 'text-caution',
		shrink = false, // Default to false to maintain backward compatibility
		selfAlign = '', // Default to empty string
		disabled = false,
		type = 'button',
		onclick = undefined
	}: Props = $props()

	const colourClasses = active
		? 'bg-black hover:bg-extremecdanger text-caution'
		: `${colourClass} ${textColourClass} hover:text-extremedanger`

	function handleClick(event: MouseEvent) {
		console.log('Button - handleClick called', { type, url });
		
		// Only prevent default if it's a '#' URL or we have an onclick handler
		if (url === '#' || onclick) {
			event.preventDefault();
			event.stopPropagation();
		}
		
		if (onclick) {
			onclick(event);
		}
		
		dispatch('click', event)
		console.log('Button - click dispatched');
	}

	const words = label.split(' ')

	const baseClasses = `${colourClasses} uppercase font-semibold text-center rounded-full border-black transition-all duration-500 hover:bg-yellow hover:border-black py-2 px-4 border ${textClass} cursor-pointer ${fullWidth ? 'w-full block text-center' : 'inline-block w-fit'} ${shrink ? 'flex-shrink-0 flex-grow-0' : ''} ${selfAlign}`
</script>

{#if type === 'submit'}
	<button {type} {disabled} class={baseClasses} onclick={handleClick}>
		{label}
	</button>
{:else if type === 'wonky'}
	<a
		href={url}
		class="text-black relative block cursor-pointer"
		role="button"
		onclick={handleClick}
	>
		{#if !active}
			<span class="absolute -top-4 right-3 block font-sans text-[2rem]">☼</span>
			{#each words as word, index}
				{#if index === 0}
					<span class="block text-xl font-medium">{word}</span>
				{:else}
					<span
						class={index === 1 ? 'mr-3 block rotate-6 text-xl font-medium' : 'text-xl font-medium'}
						>{word}</span
					>
				{/if}
			{/each}
		{/if}
		<svg
			class="h-12 w-12 transition-all {active && 'rotate-180'}"
			width="60"
			height="50"
			viewBox="0 0 60 50"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1.90487 0.0620723C0.801556 0.114612 -0.0502699 1.05162 0.00226604 2.15494C0.0548058 3.25826 0.991814 4.11008 2.09513 4.05755L1.90487 0.0620723ZM52.9782 46.7652C51.7705 38.6562 47.8067 26.6469 39.7735 16.8191C31.6822 6.92005 19.438 -0.772834 1.90487 0.0620723L2.09513 4.05755C18.162 3.29246 29.2511 10.2662 36.6765 19.3505C44.16 28.506 47.8962 39.7968 49.0218 47.3544L52.9782 46.7652Z"
				class="stroke-black fill-black fill-black"
			/>
			<path
				d="M57.5 36.5598L51 47.0598L40 42.5598"
				class="stroke-black"
				stroke-width="4"
				stroke-linecap="round"
			/>
		</svg>
	</a>
{:else}
	<a href={url} onclick={handleClick} class={baseClasses} role="button">
		{label}
	</a>
{/if}
