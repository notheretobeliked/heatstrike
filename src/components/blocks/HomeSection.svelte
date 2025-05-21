<script lang="ts">
	import Button from '$components/Button.svelte'
	import { slide } from 'svelte/transition'
	import type { EditorBlock } from '$types/wp-types'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	export let block: EditorBlock
	const children: EditorBlock[] = block.children ?? []

	const bgColor = block.attributes.backgroundColor ?? 'white'
	let isExpanded = block.homeSection.defaultActive
	const buttonLabel = block.homeSection.accordeonlabel

	function toggleAccordion() {
		isExpanded = !isExpanded
	}
</script>

<div class="px-2 md:px-0 py-4">
	<div class="m-auto {bgColor === 'black' ? '!text-white' : ''}">
		{#if children.length > 0}
			<header class="py-12 relative cursor-pointer"  on:click={toggleAccordion}>
				<BlockRenderer block={children[0]} className="header-title" />
				<div class="absolute bottom-4 right-4">
					<Button
						on:click={toggleAccordion}
						label={buttonLabel}
						variant="wonky"
						active={isExpanded}
					/>
				</div>
			</header>
			{#if isExpanded}
				<div class="accordion-content" transition:slide={{ duration: 300 }}>
					{#each children.slice(1) as block, index}
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
