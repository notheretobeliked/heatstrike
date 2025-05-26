<script lang="ts">
	import type { PageData } from './$types'
	import type { EditorBlock } from '$lib/types/wp-types'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	export let data: PageData
	let editorBlocks: EditorBlock[], uri: string

	$: {
		;({ editorBlocks, uri } = data)
	}


</script>


{#each editorBlocks as block, index (block.clientId)}
<BlockRenderer {block} />
{/each}