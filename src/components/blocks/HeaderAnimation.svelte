<script lang="ts">
	import type { EditorBlock } from '$types/wp-types'
	import { fade } from 'svelte/transition'
	import { onDestroy } from 'svelte'

	export let block: EditorBlock
	const statements = block.headerAnimation.statements

	let currentIndex = 0
	let interval

	const nextStatement = () => {
		currentIndex = (currentIndex + 1) % statements.length
	}

	const startInterval = () => {
		interval = setInterval(nextStatement, 3000) // Change statement every 3 seconds
	}

	startInterval()

	onDestroy(() => {
		clearInterval(interval)
	})
</script>

<div class="fixed -z-10 w-full h-[30vh] md:h-[50vh]">
	<div class="flex w-full h-[50vh] md:h-[50vh] relative">
		{#each statements as statement, index (index)}
			{#if index === currentIndex}
				<div
					class="absolute flex w-full h-full inset-0 !self-center bg-{statement.bgcolor[0]}"
					transition:fade
				>
					<p
						class="!font-anton !fluid-text-xl !uppercase !text-center flex items-center justify-center w-full h-full text-{statement
							.textcolor[0]}"
					>
						{statement.statement}
					</p>
				</div>
			{/if}
		{/each}
	</div>
</div>
<div class="h-[50vh] md:h-[50vh]" />
