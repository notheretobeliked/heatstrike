<script lang="ts">
	import type { CoreButton } from '$lib/graphql/generated'
	import Button from '$components/atoms/Button.svelte'

	interface Props {
		// Expect a core/button block
		block: CoreButton
	}

	let { block }: Props = $props()
	const classNames = (fontSize: string | null, textColor: string | null | undefined) => {
		let textClasses = ''
		let colorClasses = ''

		switch (fontSize) {
			case 'base':
				textClasses = 'font-sans text-sm xl:text-base'
				break
			case 'lg':
				textClasses = 'font-sans text-base md:text-lg'
				break
			case 'xl':
				textClasses = 'font-sans text-base md:text-lg lg:text-xl'
				break
			case '2xl':
				textClasses = 'font-sans text-xl md:text-2xl'
				break
			case null:
				textClasses = 'text-sans text-sm xl:text-base'
				break
		}
		
		// Only add text color class if textColor is defined
		if (textColor) {
			colorClasses = `text-${textColor}`
		}

		return `${textClasses} ${colorClasses}`.trim() // Combine classes and trim extra spaces
	}
</script>

<Button
	textClass={classNames(block.attributes?.fontSize ?? null, block.attributes?.textColor)}
	url={block.attributes?.url ?? undefined}
	label={block.attributes?.text ?? undefined}
/>
