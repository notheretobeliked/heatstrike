<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import { classNames } from '$lib/utilities/utilities'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let incrementBy = $derived((block as any).tickerNumber?.incrementBy ?? 0)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let counter = $derived((block as any).currentCount ?? 1000)
	let finalCount = $derived(counter + incrementBy)
	let textColor = $derived(block.attributes?.textColor ?? 'black')

	function formatNumberWithCommas(num: number): string {
		return num.toLocaleString('en-US')
	}
</script>

<div>
	<h1
		class="{classNames('base', textColor, 'center', null)} header-title -mt-12"
	>
		{formatNumberWithCommas(finalCount)}
	</h1>
</div>
