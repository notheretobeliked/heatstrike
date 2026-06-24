<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import { classNames } from '$lib/utilities/utilities'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let incrementBy = $derived((block as any).tickerNumber?.incrementBy ?? 0)
	// Build-time count baked into the prerendered page — the first-paint fallback.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const buildTimeCount = (block as any).currentCount ?? 1000

	let counter = $state<number>(buildTimeCount)
	let finalCount = $derived(counter + incrementBy)
	let textColor = $derived(block.attributes?.textColor ?? 'black')

	const STORAGE_KEY = 'subscriberCount'

	function formatNumberWithCommas(num: number): string {
		return num.toLocaleString('en-US')
	}

	async function refreshCount() {
		try {
			const res = await fetch('/api/subscriber-count')
			if (!res.ok) return
			const data = await res.json()
			if (typeof data.count === 'number') {
				counter = data.count
				localStorage.setItem(STORAGE_KEY, String(data.count))
			}
		} catch {
			// Non-critical; keep whatever value we already have.
		}
	}

	$effect(() => {
		// Show the last persisted value instantly (avoids a flash of the stale
		// build-time number for returning visitors), then refresh from the backend.
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored !== null && !Number.isNaN(Number(stored))) {
			counter = Number(stored)
		}

		refreshCount()
		const interval = setInterval(refreshCount, 5 * 60 * 1000)
		return () => clearInterval(interval)
	})
</script>

<div>
	<h1
		class="{classNames('base', textColor, 'center', null)} header-title -mt-12"
	>
		{formatNumberWithCommas(finalCount)}
	</h1>
</div>
