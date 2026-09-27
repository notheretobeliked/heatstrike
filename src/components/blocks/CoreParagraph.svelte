<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import type { CoreParagraphAttributes } from '$lib/graphql/generated'
	import { classNames } from '$lib/utilities/utilities'
	import { extractBlockClasses } from '$lib/utilities/block-attributes'
	import { blockReveal } from '$lib/actions/block-reveal'

	interface Props {
		block: EditorBlock
		animation?: { delay?: string }
	}

	let { block, animation }: Props = $props()
	let attrs = $derived(block.attributes as CoreParagraphAttributes | undefined)
	let bc = $derived(extractBlockClasses(block.attributes as Record<string, unknown>))

	let content = $derived(attrs?.content ?? '')
	let className = $derived(attrs?.className ?? '')
	// cssClassName is the rendered class string from wp-graphql-content-blocks;
	// it carries `has-text-align-*` even when align/className are null.
	let cssClassName = $derived(attrs?.cssClassName ?? '')

	// Map WordPress has-text-align-* classes to Tailwind
	let textAlignClass = $derived(
		cssClassName.includes('has-text-align-center') || className.includes('has-text-align-center')
			? 'text-center'
			: cssClassName.includes('has-text-align-right') || className.includes('has-text-align-right')
				? 'text-right'
				: cssClassName.includes('has-text-align-left') || className.includes('has-text-align-left')
					? 'text-left'
					: ''
	)

	// Remove WordPress alignment classes since we're converting them
	let filteredClassName = $derived(
		className
			.replace(/has-text-align-(center|right|left)/g, '')
			.trim()
	)

	let attrClasses = $derived(
		classNames(
			attrs?.fontSize,
			attrs?.textColor,
			attrs?.align,
			attrs?.fontFamily
		)
	)
</script>

{#if content}
	<p
		class="{attrClasses} {textAlignClass} {filteredClassName} {bc.spacingClasses} {bc.bgClasses} {bc.textColorClasses} {bc.alignClasses}"
		style:border-radius={bc.borderRadius}
		use:blockReveal={animation}
	>
		{@html content}
	</p>
{/if}
