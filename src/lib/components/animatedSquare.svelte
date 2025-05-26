<script lang="ts">
    type colours = 'pink' | 'red' | 'yellow' | 'burgundy' | 'lavender' | 'green' | 'blue'
	let { 
        animate = false, 
        delay = 0, 
        colour = 'pink' as colours,
        columns = 3,
        rows = 3
    } = $props<{
        animate?: boolean;
        delay?: number;
        colour?: colours;
        columns?: number;
        rows?: number;
    }>();

    // Use a consistent cell size to ensure squares
    const cellSize = 60; // Each cell is 60x60
    
    // Calculate total dimensions
    const totalWidth = cellSize * columns;
    const totalHeight = cellSize * rows;
    
    // Generate dynamic paths based on columns and rows
    const paths = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            paths.push({
                d: `M${x * cellSize} ${y * cellSize}H${(x + 1) * cellSize}V${(y + 1) * cellSize}H${x * cellSize}V${y * cellSize}Z`,
                colour
            });
        }
    }

	const randomisedPaths = [...paths].sort(() => Math.random() - 0.5);
</script>

<svg class="h-full" viewBox="0 0 {totalWidth} {totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<g style="--base-delay: {delay}ms">
		{#each randomisedPaths as path, i}
			<path
				d={path.d}
				class="{animate ? 'animate-fade other-path' : ''} {
					path.colour === 'pink' ? 'fill-pink' :
					path.colour === 'red' ? 'fill-red' :
					path.colour === 'burgundy' ? 'fill-burgundy' :
					path.colour === 'blue' ? 'fill-blue' :
					path.colour === 'green' ? 'fill-green' :
					path.colour === 'lavender' ? 'fill-lavender' : 
                    path.colour === 'yellow' ? 'fill-yellow' : ''
				}"
				style="--delay: {i * 50}ms"
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

	.other-path {
		animation-delay: calc(var(--delay) + var(--base-delay));
	}
</style>
