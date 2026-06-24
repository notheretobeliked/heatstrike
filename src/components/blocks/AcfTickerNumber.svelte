<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import { classNames } from '$lib/utilities/utilities'
	import {
		subscriberCount,
		hydrateSubscriberCount,
		setSubscriberCountFromPoll
	} from '$lib/stores/subscriberCount.svelte'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let incrementBy = $derived((block as any).tickerNumber?.incrementBy ?? 0)
	// Build-time count baked into the prerendered page — the first-paint fallback.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const buildTimeCount = (block as any).currentCount ?? 1000

	// Shared store carries optimistic bumps (from signups) and polled values, and
	// persists across navigation/reload. Fall back to the build-time number until it loads.
	let counter = $derived(subscriberCount.value ?? buildTimeCount)
	let finalCount = $derived(counter + incrementBy)
	let textColor = $derived(block.attributes?.textColor ?? 'black')

	function formatNumberWithCommas(num: number): string {
		return num.toLocaleString('en-US')
	}

	async function refreshCount() {
		try {
			const res = await fetch('/api/subscriber-count')
			if (!res.ok) return
			const data = await res.json()
			if (typeof data.count === 'number') setSubscriberCountFromPoll(data.count)
		} catch {
			// Non-critical; keep whatever value we already have.
		}
	}

	$effect(() => {
		// Seed from localStorage for instant display, then refresh from the backend.
		hydrateSubscriberCount()
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
