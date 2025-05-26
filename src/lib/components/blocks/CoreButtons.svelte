<script lang="ts">
	import CoreButton from '$components/blocks/CoreButton.svelte'
	import type { CoreButtonsBlock } from '$lib/types/wp-types'
	interface Props {
		block: CoreButtonsBlock;
	}

	let { block }: Props = $props();
	const children = block.children
	const bgColor = block.attributes.backgroundColor ?? 'white'
	const { justifyContent = 'left' } = block.attributes.layout ?? { justifyContent: 'left' }

	// Utility to generate CSS classes based on justifyContent value
	function justifyContentClass(
		justifyContent: 'space-between' | 'left' | 'right' | 'center'
	): string {
		switch (justifyContent) {
			case 'left':
				return 'justify-start'
			case 'center':
				return 'justify-center'
			case 'right':
				return 'justify-end'
			case 'space-between':
				return 'justify-between'
			default:
				return ''
		}
	}
</script>

<div class="px-2 md:px-0 my-4 md:my-6 xl:my-12">
	<div
		class={`m-auto flex gap-4 ${justifyContentClass(justifyContent)} ${bgColor === 'black' ? '!text-white-pure' : ''}`}
	>
		{#each children as block, index}
			<CoreButton {block} />
		{/each}
	</div>
</div>
