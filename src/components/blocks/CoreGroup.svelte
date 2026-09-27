<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import type { CoreGroupAttributes } from '$lib/graphql/generated'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	import RevealText from '$components/effects/RevealText.svelte'
	import Parallax from '$components/effects/Parallax.svelte'
	import { setContext } from 'svelte'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()
	let attrs = $derived(block.attributes as CoreGroupAttributes | undefined)

	let children = $derived(block.children || [])

	function presetToSpacing(value: string): string | null {
		const match = value.match(/(?:var:preset\|)?spacing\|(\d+)/)
		if (match) return String(parseInt(match[1], 10) / 10)
		return null
	}

	let gapClass = $derived.by(() => {
		const raw = attrs?.style
		if (!raw) return 'gap-0'
		try {
			const style = typeof raw === 'string' ? JSON.parse(raw) : raw
			const bg = style?.spacing?.blockGap
			// Newer Gutenberg saves blockGap as { top, left }; we use top
			// (row gap) for vertical stacking, falling back to left, then to
			// the legacy string form.
			const value =
				bg && typeof bg === 'object'
					? ((bg as Record<string, unknown>).top ??
						(bg as Record<string, unknown>).left)
					: bg
			if (value === undefined || value === null || value === '') return 'gap-0'
			if (value === '0' || value === 0) return 'gap-0'
			const tw = presetToSpacing(String(value))
			return tw ? `gap-${tw}` : 'gap-0'
		} catch {
			return 'gap-0'
		}
	})

	let layoutType = $derived.by(() => {
		const raw = attrs?.layout
		if (!raw) return null
		try {
			const layout = typeof raw === 'string' ? JSON.parse(raw) : raw
			return layout?.type ?? null
		} catch {
			return null
		}
	})

	let childForceFull = $derived(layoutType === 'default')
	// "Inner blocks use content width" toggle in the editor. When checked,
	// WP saves layout.type === 'constrained'. We mirror WP's is-layout-constrained
	// CSS for prose children that bypass BlockRenderer's alignment wrapper.
	let isConstrained = $derived(layoutType === 'constrained')

	// Section behaviour / reveal / parallax extensions
	let sectionBehavior = $derived(
		((attrs as Record<string, unknown>)?.sectionBehavior as string) ?? 'normal'
	)
	let sectionMinHeight = $derived(
		((attrs as Record<string, unknown>)?.sectionMinHeight as string) ?? 'auto'
	)
	let sectionContentAlign = $derived(
		((attrs as Record<string, unknown>)?.sectionContentAlign as
			| 'top'
			| 'center'
			| 'bottom'
			| 'stretch') ?? 'center'
	)
	let sectionReveal = $derived(
		((attrs as Record<string, unknown>)?.sectionReveal as
			| 'none'
			| 'scroll-locked'
			| 'once-on-enter') ?? 'none'
	)
	let sectionRevealDirection = $derived(
		((attrs as Record<string, unknown>)?.sectionRevealDirection as
			| 'up'
			| 'from-left'
			| 'fade-only') ?? 'up'
	)
	let sectionRevealStagger = $derived(
		Number((attrs as Record<string, unknown>)?.sectionRevealStagger ?? 60)
	)
	let sectionParallax = $derived(
		((attrs as Record<string, unknown>)?.sectionParallax as boolean) === true
	)

	let hasMinHeight = $derived(sectionMinHeight === 'screen' || sectionMinHeight === 'half')

	// Auto-stretch when the section has a single Columns child — common case
	// of a 2-col layout where the columns should fill 100vh. With multiple
	// direct children (heading + columns + spacer etc.), stretch mode would
	// give the first child the full row and stack the rest in auto rows;
	// fall back to sectionContentAlign in that case so authors can rely on
	// `center` for vertically centred stacks.
	let onlyChildIsColumns = $derived(
		children.length === 1 &&
			(children[0] as { name?: string })?.name === 'core/columns'
	)
	let useFillLayout = $derived(
		hasMinHeight && (sectionContentAlign === 'stretch' || onlyChildIsColumns)
	)

	// Provide a fill-height context to descendants when in stretch mode.
	// CoreColumns / leaf blocks read this via getContext('section-fill-height')
	// to cascade h-full through the layout tree without touching BlockRenderer.
	// setContext must run synchronously at component init, so we pass a $state
	// object whose `value` field is updated reactively in the effect below.
	const fillCtx = $state({ value: false })
	setContext('section-fill-height', fillCtx)
	$effect(() => {
		fillCtx.value = useFillLayout
	})

	let sectionClasses = $derived.by(() => {
		const classes: string[] = []
		if (sectionMinHeight === 'screen') classes.push('min-h-svh')
		else if (sectionMinHeight === 'half') classes.push('min-h-[50svh]')
		return classes.join(' ')
	})

	// Layout matrix:
	//   - no min-height: plain flex column (existing behaviour)
	//   - min-height + (stretch OR has Columns child): grid one row at 1fr so
	//     the child fills the section
	//   - min-height + top: flex column starting at top
	//   - min-height + bottom: flex column ending at bottom
	//   - min-height + center (default, prose-only): grid one column, vertically centred
	let layoutClasses = $derived.by(() => {
		if (!hasMinHeight) return 'flex flex-col'
		if (useFillLayout) return 'grid grid-cols-1 grid-rows-[1fr]'
		switch (sectionContentAlign) {
			case 'top':
				return 'flex flex-col justify-start'
			case 'bottom':
				return 'flex flex-col justify-end'
			default:
				return 'grid grid-cols-1 content-center'
		}
	})

	let wrapperClasses = $derived(
		[
			layoutClasses,
			gapClass,
			sectionClasses,
			isConstrained ? 'section-group-constrained' : ''
		]
			.filter(Boolean)
			.join(' ')
	)

	// data-section-behavior is read by a global :has() rule (in app.css) to apply
	// position:sticky to the BlockRenderer wrapper above us. Keeps the
	// behaviour declarative without baking core/group logic into BlockRenderer.
	let dataBehavior = $derived(sectionBehavior === 'stick' ? 'stick' : null)
</script>

{#if sectionParallax}
	<Parallax class={wrapperClasses} dataSectionBehavior={dataBehavior}>
		{#each children as childBlock, i}
			<BlockRenderer block={childBlock} forceFull={childForceFull} staggerIndex={i} />
		{/each}
	</Parallax>
{:else if sectionReveal !== 'none'}
	<RevealText
		class={wrapperClasses}
		trigger={sectionReveal}
		direction={sectionRevealDirection}
		stagger={sectionRevealStagger}
		dataSectionBehavior={dataBehavior}
	>
		{#each children as childBlock, i}
			<BlockRenderer block={childBlock} forceFull={childForceFull} staggerIndex={i} />
		{/each}
	</RevealText>
{:else}
	<div class={wrapperClasses} data-section-behavior={dataBehavior}>
		{#each children as childBlock, i}
			<BlockRenderer block={childBlock} forceFull={childForceFull} staggerIndex={i} />
		{/each}
	</div>
{/if}

<style>
	/* All core-group wrappers are positioned so they share the same paint
	   phase as sticky siblings. Without this, a sticky (positioned) sibling
	   paints OVER non-sticky (static) later siblings even though they come
	   later in DOM order — making non-sticky group backgrounds invisible
	   under a sticky predecessor. */
	:global(.core-group) {
		position: relative;
	}

	/* Sticky-stack behaviour: when an inner CoreGroup div has data-section-behavior=stick,
	   apply position:sticky to its BlockRenderer wrapper (the parent in the DOM).
	   The wrapper sits as a sibling within <main>, which is the correct containing
	   block for the stack effect (the inner div is too short to stick within).
	   No explicit z-index — relying on tree-order paint within the same stack
	   level so later siblings cover earlier ones. */
	:global(.core-group:has(> [data-section-behavior='stick'])) {
		position: sticky;
		top: 0;
	}
</style>
