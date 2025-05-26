<script lang="ts">

	import { run } from 'svelte/legacy'

	import type { EditorBlock } from '$lib/types/wp-types'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	import type { PageData } from './$types'
	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
	let editorBlocks: EditorBlock[] = $state(),
		uri: string = $state()

	let isHomePage: boolean = $state(false)

	
	run(() => {
		;({ editorBlocks, uri } = data)
		isHomePage = uri === '/'
	})


</script>

<div class="{isHomePage ? 'homepage' : ''} ">
	{#each editorBlocks as block, index (block.clientId)}
		<BlockRenderer {block} />
	{/each}
</div>
