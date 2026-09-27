<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import type { CoreImageAttributes } from '$lib/graphql/generated'
	import { extractBlockClasses } from '$lib/utilities/block-attributes'
	import { blockReveal } from '$lib/actions/block-reveal'

	interface Props {
		block: EditorBlock
		animation?: { delay?: string }
	}

	let { block, animation }: Props = $props()
	let attrs = $derived(block.attributes as CoreImageAttributes | undefined)
	let bc = $derived(extractBlockClasses(block.attributes as Record<string, unknown>))

	let sizes = $derived(
		(block.mediaDetails?.sizes ?? []) as Array<{
			sourceUrl?: string
			width?: string
			height?: string
		}>
	)
	let src = $derived(attrs?.url ?? '')
	let alt = $derived(attrs?.alt ?? '')
	let caption = $derived(attrs?.caption)
	let align = $derived(attrs?.align)
	let aspectRatio = $derived(attrs?.aspectRatio)
	let scale = $derived(attrs?.scale)
	let customWidth = $derived(attrs?.width)
	let customHeight = $derived(attrs?.height)
	let href = $derived(attrs?.href)
	let linkTarget = $derived(attrs?.linkTarget)

	// Resolve intrinsic width/height from mediaDetails when not set by the editor,
	// so the browser can reserve space and avoid layout shift (CLS). If only one
	// editor dimension is set, use 'auto' for the other so it's derived from the
	// aspect ratio.
	let matchedSize = $derived(sizes.find((s) => s?.sourceUrl === src))
	let intrinsicWidth = $derived(
		customWidth || (customHeight ? 'auto' : matchedSize?.width) || undefined
	)
	let intrinsicHeight = $derived(
		customHeight || (customWidth ? 'auto' : matchedSize?.height) || undefined
	)

	// Only use srcset if the full-size src is represented in the sizes array.
	// Otherwise the browser picks a small thumbnail instead of the full original.
	let hasSrcInSizes = $derived(sizes.some((s) => s?.sourceUrl === src))
	let srcSet = $derived(
		hasSrcInSizes
			? sizes
					.filter((s) => s?.sourceUrl && s?.width)
					.map((s) => `${s!.sourceUrl} ${s!.width}w`)
					.join(', ')
			: ''
	)

	let borderRadius = $derived.by(() => {
		const raw = attrs?.style
		if (!raw) return ''
		try {
			const style = typeof raw === 'string' ? JSON.parse(raw) : raw
			const radius = style?.border?.radius
			if (!radius) return ''
			if (typeof radius === 'string') return radius
			const { topLeft, topRight, bottomRight, bottomLeft } = radius
			return `${topLeft ?? '0'} ${topRight ?? '0'} ${bottomRight ?? '0'} ${bottomLeft ?? '0'}`
		} catch {
			return ''
		}
	})

	let imgStyle = $derived.by(() => {
		const parts: string[] = []
		if (customWidth) parts.push(`width:${customWidth}`)
		if (customHeight) parts.push(`height:${customHeight}`)
		if (aspectRatio) {
			parts.push(`aspect-ratio:${aspectRatio}`)
			parts.push(`object-fit:${scale || 'cover'}`)
		}
		if (borderRadius) parts.push(`border-radius:${borderRadius}`)
		return parts.join(';')
	})

	// The figure declares its alignment bucket; the `.page-main` parent rule
	// caps non-align figures at the content width and centers them. Wide/full
	// carry the matching class so the parent rule lets them break out.
	let alignClass = $derived(
		align === 'wide'
			? 'alignwide w-full'
			: align === 'full'
				? 'alignfull w-full max-w-full'
				: 'w-full'
	)

	let isFullWidth = $derived(align === 'full' || align === 'wide')

	// Image alignment happens within the (content-width) figure. With a custom
	// width the margin controls placement; center/left/right map to mx-auto /
	// left / right. Without a custom width a centered image still uses mx-auto.
	let imgAlignClass = $derived.by(() => {
		if (!customWidth) return align === 'center' ? 'block mx-auto' : ''
		if (align === 'center') return 'block mx-auto'
		if (align === 'right') return 'block ml-auto mr-0'
		return 'block ml-0 mr-auto'
	})

	let imgClass = $derived(
		[
			customWidth || customHeight
				? 'h-auto max-w-full'
				: isFullWidth || aspectRatio
					? 'w-full h-auto'
					: 'max-w-full h-auto',
			imgAlignClass
		]
			.filter(Boolean)
			.join(' ')
	)
</script>

{#if src}
	<figure
		class="{alignClass} {bc.spacingClasses} {bc.bgClasses} {bc.textColorClasses} relative @container"
		use:blockReveal={animation}
	>
		{#if href}
			<a {href} target={linkTarget || undefined} class="border-0 no-underline">
				<img
					{src}
					{alt}
					srcset={srcSet || undefined}
					sizes={srcSet ? '100vw' : undefined}
					width={intrinsicWidth || undefined}
					height={intrinsicHeight || undefined}
					class={imgClass}
					style={imgStyle || undefined}
					loading="lazy"
				/>
			</a>
		{:else}
			<img
				{src}
				{alt}
				srcset={srcSet || undefined}
				sizes={srcSet ? '100vw' : undefined}
				width={intrinsicWidth || undefined}
				height={intrinsicHeight || undefined}
				class={imgClass}
				style={imgStyle || undefined}
				loading="lazy"
			/>
		{/if}
		{#if caption}
			<figcaption class="font-sans text-sm mt-2 text-center">{@html caption}</figcaption>
		{/if}
	</figure>
{/if}
