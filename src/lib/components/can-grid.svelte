<script lang="ts">
	import { onMount } from 'svelte'
	import { Spring } from 'svelte/motion'

	type Colour = 'pink' | 'red' | 'yellow' | 'burgundy' | 'lavender' | 'green' | 'blue' | 'white' | 'transparent';

	type GridColor = {
		x: number;
		y: number;
		color: Colour;
	}

	type LetterCoordinate = {
		letter: 'C' | 'A' | 'N';
		x: number;
		y: number;
	}

	let { 
		rows = 3, 
		columns = 3, 
		colors = [], 
		CANcoordinates = null 
	} = $props<{
		rows?: number;
		columns?: number;
		colors?: GridColor[];
		CANcoordinates?: LetterCoordinate[] | null;
	}>();

	let isExpanded = $state(false)
	let isWrapperAnimationComplete = $state(false)
	let mounted = $state(false)
	let animationStarted = $state(false)
	
	// Track the current color state for each cell
	let cellAnimations = $state<{
		x: number, 
		y: number, 
		currentColor: Colour, 
		targetColor: Colour, 
		blinkCount: number, 
		maxBlinks: number,
		speed: number
	}[]>([]);
	
	// Track the current letter state for each cell
	let letterAnimations = $state<{
		x: number, 
		y: number, 
		currentLetter: string | null, 
		targetLetter: string | null, 
		blinkCount: number, 
		maxBlinks: number,
		speed: number
	}[]>([]);

	const size = new Spring(1, {
		stiffness: 0.1,
		damping: 0.6
	})
	
	// Available colors for blinking - using the defined colour type
	const availableColors: Colour[] = ['pink', 'red', 'yellow', 'burgundy', 'lavender', 'green', 'blue', 'white', 'transparent'];
	
	// Available letters for blinking
	const availableLetters = ['C', 'A', 'N'];
	
	// Available animation speeds
	const animationSpeeds = [50, 200, 300];

	onMount(() => {
		mounted = true
		
		// Initialize cell animations - only for cells with defined colors
		colors.forEach((cell: GridColor) => {
			const maxBlinks = Math.floor(Math.random() * 3) + 2; // Random between 2 and 4 blinks
			const speed = animationSpeeds[Math.floor(Math.random() * animationSpeeds.length)];
			
			cellAnimations.push({
				x: cell.x,
				y: cell.y,
				currentColor: getRandomColor(cell.color),
				targetColor: cell.color,
				blinkCount: 0,
				maxBlinks,
				speed
			});
		});
		
		// Initialize letter animations - only for cells with defined letters
		if (CANcoordinates) {
			CANcoordinates.forEach((letterCell: LetterCoordinate) => {
				const maxBlinks = Math.floor(Math.random() * 3) + 2; // Random between 2 and 4 blinks
				const speed = animationSpeeds[Math.floor(Math.random() * animationSpeeds.length)];
				
				letterAnimations.push({
					x: letterCell.x,
					y: letterCell.y,
					currentLetter: null,  // Start with no letter
					targetLetter: letterCell.letter,
					blinkCount: 0,
					maxBlinks,
					speed
				});
			});
		}
		
		// Set animation started flag to true
		animationStarted = true;
		
		// Start blinking animations immediately
		startBlinkAnimations();
		startLetterAnimations();
		
		// Start the expansion animation
		setTimeout(() => {
			isExpanded = true
			size.target = 2
			
			setTimeout(() => {
				isWrapperAnimationComplete = true
			}, 500)
		}, 700)
	})
	
	// Get a random color different from the target
	function getRandomColor(targetColor: Colour): Colour {
		const filteredColors = availableColors.filter(c => c !== targetColor);
		return filteredColors[Math.floor(Math.random() * filteredColors.length)];
	}
	
	// Get a random letter
	function getRandomLetter(): string {
		return availableLetters[Math.floor(Math.random() * availableLetters.length)];
	}
	
	// Get the target letter for a cell (if any)
	function getTargetLetterForCell(x: number, y: number): string | null {
		if (!CANcoordinates) return null;
		const letterCell = CANcoordinates.find((c: LetterCoordinate) => c.x === x && c.y === y);
		return letterCell ? letterCell.letter : null;
	}
	
	// Start the blinking animations for all cells
	function startBlinkAnimations() {
		cellAnimations.forEach(cell => {
			blinkCell(cell);
		});
	}
	
	// Start the letter animations for all cells
	function startLetterAnimations() {
		letterAnimations.forEach(cell => {
			blinkLetter(cell);
		});
	}
	
	// Recursive function to handle cell blinking
	function blinkCell(cell: typeof cellAnimations[0]) {
		if (cell.blinkCount >= cell.maxBlinks) {
			// Animation complete, set to final color
			cell.currentColor = cell.targetColor;
			return;
		}
		
		// Set to a random color
		cell.currentColor = getRandomColor(cell.targetColor);
		cell.blinkCount++;
		
		// Schedule next blink
		setTimeout(() => {
			if (cell.blinkCount === cell.maxBlinks) {
				// Last blink, set to target color
				cell.currentColor = cell.targetColor;
			} else {
				// Continue blinking
				blinkCell(cell);
			}
		}, cell.speed); // Use the cell's random speed
	}
	
	// Recursive function to handle letter blinking
	function blinkLetter(cell: typeof letterAnimations[0]) {
		if (cell.blinkCount >= cell.maxBlinks) {
			// Animation complete, set to final letter
			cell.currentLetter = cell.targetLetter;
			return;
		}
		
		// 50% chance to show a random letter, 50% chance to show nothing
		const showLetter = Math.random() > 0.5;
		cell.currentLetter = showLetter ? getRandomLetter() : null;
		cell.blinkCount++;
		
		// Schedule next blink
		setTimeout(() => {
			if (cell.blinkCount === cell.maxBlinks) {
				// Last blink, set to target letter
				cell.currentLetter = cell.targetLetter;
			} else {
				// Continue blinking
				blinkLetter(cell);
			}
		}, cell.speed); // Use the cell's random speed
	}

	// Helper function to find color for a specific cell
	function getColorForCell(x: number, y: number): string {
		// Check if cell is currently animating
		const animatingCell = cellAnimations.find(c => c.x === x && c.y === y);
		if (animatingCell) {
			return `fill-${animatingCell.currentColor}`;
		}
		
		// Fall back to static color from props
		const cell = colors.find((c: GridColor) => c.x === x && c.y === y);
		return cell ? `fill-${cell.color}` : '';
	}

	// Helper function to find letter for a specific cell
	function getLetterForCell(x: number, y: number): string | null {
		// If animation hasn't started yet, don't show any letters
		if (!animationStarted) return null;
		
		// Check if cell is currently animating
		const animatingCell = letterAnimations.find(c => c.x === x && c.y === y);
		if (animatingCell) {
			return animatingCell.currentLetter;
		}
		
		// Fall back to static letter from props
		if (!CANcoordinates) return null;
		const letterCell = CANcoordinates.find((c: LetterCoordinate) => c.x === x && c.y === y);
		return letterCell ? letterCell.letter : null;
	}
	
	// Calculate font size as 100% of cell height
	const letterSize = 1;

	// This is a utility to ensure Tailwind includes all our color classes
	// It's never used, just here to make Tailwind aware of the classes
	const tailwindColorClasses = [
		'fill-pink',
		'fill-red',
		'fill-yellow',
		'fill-burgundy',
		'fill-lavender',
		'fill-green',
		'fill-blue',
		'fill-white',
		'fill-transparent'
	];
</script>

<div class="relative h-full" style="aspect-ratio: {columns} / {rows}">
	<svg viewBox="0 0 {columns} {rows}" width="100%" height="100%" preserveAspectRatio="none">
		<!-- Only render cells that have a defined color -->
		{#each colors as cell}
			{@const color = getColorForCell(cell.x, cell.y)}
			{@const letter = getLetterForCell(cell.x, cell.y)}
			
			<rect 
				x={cell.x} 
				y={cell.y} 
				width="1" 
				height="1" 
				class="{color} animate-fade"
				fill={color ? undefined : "transparent"}
			/>
			
			{#if letter && mounted}
				<!-- Using a group to center the text perfectly -->
				<g transform="translate({cell.x + 0.5}, {cell.y + 0.5})">
					<text 
						x="0" 
						y="0.1"
						text-anchor="middle"
						alignment-baseline="middle"
						font-size="{letterSize}"
						font-weight="bold"
						class="letter fill-black"
					>
						{letter}
					</text>
				</g>
			{/if}
		{/each}
	</svg>
</div>

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

	.letter {
		font-family: var(--default-font-family, sans-serif);
		text-transform: uppercase;
	}
</style>
