<script lang="ts">
	import type { CoreImage, MediaItem } from '$lib/graphql/generated'
	import Image from '$components/atoms/Image.svelte'
	interface Props {
		block: CoreImage
	}

	let { block }: Props = $props()

	const imageObject = {
		altText: block.attributes?.alt ? block.attributes.alt : '',
		mediaDetails: {
			sizes: block.mediaDetails?.sizes ?? []
		},
		contentTypeName: 'attachment',
		databaseId: 0,
		id: '',
		isComment: false,
		isTermNode: false,
		slug: '',
		uri: ''
	} as MediaItem

	const aspectRatio = block.attributes?.aspectRatio || 'auto'
	let aspectRatioClass = ''

	switch (aspectRatio) {
		case '1':
			aspectRatioClass = 'aspect-square'
			break
		case '4/3':
			aspectRatioClass = 'aspect-[4/3]'
			break
		case '3/4':
			aspectRatioClass = 'aspect-[3/4]'
			break
		case '3/2':
			aspectRatioClass = 'aspect-[3/2]'
			break
		case '16/9':
			aspectRatioClass = 'aspect-[16/9]'
			break
		case '9/16':
			aspectRatioClass = 'aspect-[9/16]'
			break
		default:
			aspectRatioClass = 'aspect-auto'
	}

</script>

<figure class="mb-4 w-full">
	<Image {imageObject} imageSize="large" extraClasses={aspectRatioClass} fit="cover" />
	{#if block.attributes?.caption}
		<figcaption class="font-inter mt-2 text-center text-sm">{block.attributes.caption}</figcaption>
	{/if}
</figure>
