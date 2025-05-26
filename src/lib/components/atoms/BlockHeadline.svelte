<script lang="ts">
	interface Props {
		label?: string | undefined
		primaryColour?: string | undefined
		secondaryColour?: string | undefined
		variant?: 'one' | 'two' | 'three'
	}

	let {
		label = 'Read more',
		primaryColour = 'lavender',
		secondaryColour = 'yellow',
		variant = 'one'
	}: Props = $props()

	let variantClass = $state('')

	switch (variant) {
		case 'one':
			variantClass = 'aspect-square '
			break
		case 'two':
			variantClass = 'aspect-square left-[calc(200%/3)] '
			break
		case 'three':
			variantClass = 'hidden'
			break
	}
</script>

<div class="@container">
	<header
		class="relative flex aspect-[6/1] @sm:aspect-[4/1] @lg:aspect-[9/1] w-full items-center justify-center"
	>
		<div class="{variantClass} z-10 absolute left-0 hidden h-full"></div>
		<h2
			class="z-20 mx-[3%] w-full px-2 text-center text-base font-semibold uppercase md:text-lg lg:mx-0"
		>
			{label}
		</h2>
	</header>
</div>
