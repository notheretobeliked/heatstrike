<script lang="ts">
	import BlockRenderer from '$components/BlockRenderer.svelte'
	import type { PageData } from './$types'
	

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
	let editorBlocks = $derived(data.editorBlocks ?? [])
</script>

<div class="page-main min-h-screen flex flex-col">
	{#each editorBlocks as block (block.clientId)}
		<BlockRenderer {block} />
	{/each}
</div>
