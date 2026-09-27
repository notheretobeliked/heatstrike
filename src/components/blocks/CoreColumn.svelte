<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import type { CoreColumnAttributes } from '$lib/graphql/generated'
	import BlockRenderer from '$components/BlockRenderer.svelte'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()
	let attrs = $derived(block.attributes as CoreColumnAttributes | undefined)

	// Map vertical alignment to CSS classes
	const getAlignmentClass = (alignment: string) => {
		switch (alignment) {
			case 'top':
				return 'self-start'
			case 'center':
				return 'self-center justify-center'
			case 'bottom':
				return 'self-end justify-end'
			case 'stretch':
				return 'self-stretch'
			default:
				return 'self-start'
		}
	}

	function presetToSpacing(value: string): string | null {
		const match = value.match(/(?:var:preset\|)?spacing\|(\d+)/)
		if (match) return String(parseInt(match[1], 10) / 10)
		return null
	}

	let verticalAlignment = $derived(attrs?.verticalAlignment || 'top')
	let alignmentClass = $derived(getAlignmentClass(verticalAlignment))
	let customClasses = $derived(attrs?.className || '')
	let children = $derived(block.children || [])
	// Gap only — padding is applied once on the wrapper by BlockRenderer.
	// Extracting it here as well produced doubled padding.
	let gapClass = $derived.by(() => {
		const raw = attrs?.style
		if (!raw) return 'gap-0'
		try {
			const style = typeof raw === 'string' ? JSON.parse(raw) : raw
			const blockGap = style?.spacing?.blockGap
			if (blockGap === undefined || blockGap === null) return 'gap-0'
			if (blockGap === '0' || blockGap === 0) return 'gap-0'
			const tw = presetToSpacing(String(blockGap))
			return tw ? `gap-${tw}` : 'gap-0'
		} catch {
			return ''
		}
	})
</script>

<div class="flex flex-col h-full grow min-w-0 {alignmentClass} {customClasses} {gapClass}">
	{#each children as childBlock}
		<BlockRenderer block={childBlock} />
	{/each}
</div>
