<script lang="ts">
	import type { CoreHeading } from '$lib/graphql/generated'
	import { classNames } from '$lib/utilities/utilities'

	interface Props {
		block: CoreHeading
	}

	let { block }: Props = $props()
	const {
		content = '',
		fontSize = 'base',
		textColor = '',
		textAlign = 'left',
		level = 1,
		fontFamily = 'sans',
		className = ''
	} = block.attributes ?? {}

</script>

{#if content}
	{#if level === 1}
		<h1 class="{classNames(fontSize, textColor, textAlign, 'display')} {className}">
			{@html content}
		</h1>
	{/if}
	{#if level === 2}
		<h2 class="{classNames(fontSize, textColor, textAlign, 'sans')} {className} my-5">
			{@html content}
		</h2>
	{/if}
	{#if level === 3}
		<h3 class="{classNames(fontSize, textColor, textAlign, 'sans')} {className}">
			{@html content}
		</h3>
	{/if}
	{#if level === 4}
		<div class="py-4">
			<h3
				class=" {classNames(
					fontSize,
					textColor,
					textAlign
				)} font-sans origin-top-left -rotate-6 {className}"
			>
				{@html content}
			</h3>
		</div>
	{/if}

	{#if level === 5}
		<h5
			class="{classNames(
				fontSize || 'xs',
				textColor || '',
				textAlign || 'left',
				fontFamily || 'inter'
			)} {className} mx-2 mb-3 px-2 uppercase leading-tight tracking-widest md:px-4 lg:mx-0"
		>
			{@html content}
		</h5>
	{/if}
{/if}
