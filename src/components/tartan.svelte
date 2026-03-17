<script lang="ts">
	let { animate = false, delay = 0 } = $props()

	const paths = [
		{ d: 'M60 0H0V60H60V0Z', color: 'pink' },
		{ d: 'M60 240H0V300H60V240Z', color: 'red' },
		{ d: 'M60 60H0V120H60V60Z', color: 'yellow' },
		{ d: 'M60 300H0V360H60V300Z', color: 'yellow' },
		{ d: 'M60 120H0V180H60V120Z', color: 'burgundy' },
		{ d: 'M60 360H0V420H60V360Z', color: 'pink' },
		{ d: 'M60 180H0V240H60V180Z', color: 'yellow' },
		{ d: 'M60 420H0V480H60V420Z', color: 'yellow' },
		{ d: 'M120 0H60V60H120V0Z', color: 'yellow' },
		{ d: 'M120 240H60V300H120V240Z', color: 'yellow' },
		{ d: 'M120 60H60V120H120V60Z', color: 'blue' },
		{ d: 'M120 300H60V360H120V300Z', color: 'green' },
		{ d: 'M120 120H60V180H120V120Z', color: 'yellow' },
		{ d: 'M120 360H60V420H120V360Z', color: 'yellow' },
		{ d: 'M120 180H60V240H120V180Z', color: 'lavender' },
		{ d: 'M120 420H60V480H120V420Z', color: 'blue' }
	]

	const yellowPaths = paths.filter((p) => p.color === 'yellow')
	const otherPaths = paths.filter((p) => p.color !== 'yellow').sort(() => Math.random() - 0.5)
</script>

<svg class="h-full" viewBox="0 0 120 480" fill="none" xmlns="http://www.w3.org/2000/svg">
	<g style="--base-delay: {delay}ms">
		{#each yellowPaths as path}
			<path d={path.d} class="fill-yellow {animate ? 'animate-fade yellow-path' : ''}" />
		{/each}

		{#each otherPaths as path, i}
			<path
				d={path.d}
				class="{animate ? 'animate-fade other-path' : ''} {
					path.color === 'pink' ? 'fill-pink' :
					path.color === 'red' ? 'fill-red' :
					path.color === 'burgundy' ? 'fill-burgundy' :
					path.color === 'blue' ? 'fill-blue' :
					path.color === 'green' ? 'fill-green' :
					path.color === 'lavender' ? 'fill-lavender' : ''
				}"
				style="--delay: {500 + i * 100}ms"
			/>
		{/each}
	</g>
</svg>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fade {
		opacity: 0;
		animation: fadeIn 400ms ease-out forwards;
	}

	.yellow-path {
		animation-delay: calc(200ms + var(--base-delay));
	}

	.other-path {
		animation-delay: calc(var(--delay) + var(--base-delay));
	}
</style>