<script lang="ts">
	import CoreParagraph from '$components/blocks/CoreParagraph.svelte'
	import CoreHeading from '$components/blocks/CoreHeading.svelte'
	import CoreGroup from '$components/blocks/CoreGroup.svelte'
	import CoreColumns from '$components/blocks/CoreColumns.svelte'
	import CoreColumn from '$components/blocks/CoreColumn.svelte'
	import CoreSpacer from './blocks/CoreSpacer.svelte'
	import CoreButtons from './blocks/CoreButtons.svelte'
	import CoreButton from './blocks/CoreButton.svelte'
	import HomeSection from './blocks/HomeSection.svelte'
	import SignupForm from './blocks/SignupForm.svelte'
	import HeaderAnimation from './blocks/HeaderAnimation.svelte'

	export let block: EditorBlock
	export let className: string = ''

	let align = block.attributes.align || 'none'
	const bgColor = block.attributes.backgroundColor ?? ''

	interface StyleObject {
		spacing?: {
			padding?: {
				top?: string
				bottom?: string
			}
		}
	}

	function mapSpacingToTailwind(styleObj: StyleObject): string {
		let classes = ''
		const topPadding = styleObj?.spacing?.padding?.top?.replace('spacing|', '')
		const bottomPadding = styleObj?.spacing?.padding?.bottom?.replace('spacing|', '')

		if (topPadding) {
			const topValue = parseInt(topPadding, 10) / 10
			classes += ` pt-${topValue}`
		}

		if (bottomPadding) {
			const bottomValue = parseInt(bottomPadding, 10) / 10
			classes += ` pb-${bottomValue}`
		}

		return classes.trim()
	}

	const spacingClasses = block.attributes.style
		? mapSpacingToTailwind(block.attributes.style as StyleObject)
		: ''

	const classNames = (align: string | null): string => {
		let baseClasses = ''
		switch (align) {
			case 'full':
				baseClasses = 'w-full max-w-full'
				break
			case 'wide':
				baseClasses = 'w-full max-w-[980px] mx-auto'
				break
			case 'none':
				baseClasses = 'w-full max-w-[852px] mx-auto'
				break
			case 'center':
				baseClasses = 'w-full max-w-[852px] mx-auto'
				break
			case null:
				baseClasses = 'w-full'
				break
		}
		return `${baseClasses} ${spacingClasses}`
	}
</script>

<div class="{classNames(align)} bg-{bgColor} !px-0">
	{#if block.name === 'core/group'}
		<CoreGroup {block} />
	{/if}

	{#if block.name === 'core/buttons'}
		<CoreButtons {block} />
	{/if}

	{#if block.name === 'core/button'}
		<CoreButton {block} />
	{/if}

	{#if block.name === 'core/columns'}
		<CoreColumns {block} />
	{/if}

	{#if block.name === 'core/column'}
		<CoreColumn {block} />
	{/if}

	{#if block.name === 'core/paragraph'}
		<CoreParagraph {block} />
	{/if}

	{#if block.name === 'core/heading'}
		<CoreHeading {block} className={className} />
	{/if}

	{#if block.name === 'core/spacer'}
		<CoreSpacer {block} />
	{/if}

	{#if block.name === 'acf/home-section'}
		<HomeSection {block} />
	{/if}

	{#if block.name === 'acf/signup-form'}
		<SignupForm {block} />
	{/if}

	{#if block.name === 'acf/header-animation'}
		<HeaderAnimation {block} />
	{/if}
</div>
