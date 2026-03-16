<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import ProjectButton from '$components/atoms/ProjectButton.svelte'
	import { slide } from 'svelte/transition'
	import BlockRenderer from '$components/BlockRenderer.svelte'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()
	const children = block.children ?? []

	const bgColor = block?.attributes?.backgroundColor ?? 'white'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let isExpanded = $state((block as any).homeSection?.defaultActive ?? false)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const buttonLabel = (block as any).homeSection?.accordeonlabel ?? 'Read more'

	function toggleAccordion(event: Event) {
		event.preventDefault()
		event.stopPropagation()
		isExpanded = !isExpanded
	}

	const headerBlock: EditorBlock | null = children[0]
		? {
				...children[0],
				attributes: {
					...children[0].attributes,
					className: 'header-title'
				}
			}
		: null
</script>

<div class="px-2 md:px-0 py-4">
	<div class="m-auto {bgColor === 'black' ? '!text-white' : ''}">
		{#if children.length > 0}
			<button
				type="button"
				class="header py-12 relative cursor-pointer w-full text-left"
				onclick={toggleAccordion}
			>
				{#if headerBlock}
					<BlockRenderer block={headerBlock} />
				{/if}
				<div class="absolute bottom-4 right-4">
					<ProjectButton
						label={buttonLabel}
						active={isExpanded}
						type="wonky"
						onclick={(e) => toggleAccordion(e)}
					/>
				</div>
			</button>
			{#if isExpanded}
				<div class="accordion-content" transition:slide={{ duration: 300 }}>
					{#each children.slice(1) as childBlock}
						<BlockRenderer block={childBlock} />
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	:global(h1.header-title) {
		font-family: Anton, sans-serif;
		font-size: clamp(5.453rem, 3.102rem + 11.75vw, 14.386rem);
		line-height: 1;
		letter-spacing: -0.05rem;
		text-transform: uppercase;
		text-align: center;
		align-self: center;
		padding-left: 3.5rem;
		padding-right: 3.5rem;
	}
</style>
