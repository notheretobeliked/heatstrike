<script lang="ts">
	import Button from '$components/atoms/Button.svelte'
	import { slide } from 'svelte/transition'
	import type { AcfHomeSection, EditorBlock } from '$lib/graphql/generated'
	import BlockRenderer from '$components/BlockRenderer.svelte'

	interface Props {
		block: AcfHomeSection;
	}

	let { block } = $props()
	const children = block.children ?? []

	const bgColor = block?.attributes?.backgroundColor ?? 'white'
	let isExpanded = $state(block.homeSection.defaultActive)
	const buttonLabel = block.homeSection.accordeonlabel

	function toggleAccordion(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		isExpanded = !isExpanded
	}

	const headerBlock = children[0] ? {
		...children[0],
		attributes: {
			...children[0].attributes,
			className: 'header-title'
		}
	} : null;
</script>

<div class="px-2 md:px-0 py-4">
	<div class="m-auto {bgColor === 'black' ? '!text-white' : ''}">
		{#if children.length > 0}
			<button type="button" class="header py-12 relative cursor-pointer w-full text-left" onclick={toggleAccordion}>
				<BlockRenderer block={headerBlock} />
				<div class="absolute bottom-4 right-4">
					<Button
						label={buttonLabel}
						active={isExpanded}
						type="wonky"
						onclick={(e) => toggleAccordion(e)}
					/>
				</div>
			</button>
			{#if isExpanded}
				<div class="accordion-content" transition:slide={{ duration: 300 }}>
					{#each children.slice(1) as block}
						<BlockRenderer {block} />
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style lang="postcss">
	:global(.header-title) {
		@apply !self-center !font-anton !fluid-text-xl !uppercase !text-center md:!px-14;
	}
</style>
