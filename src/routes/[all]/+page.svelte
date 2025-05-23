<script lang="ts">
	import type { PageData } from './$types'
	import type { EditorBlock } from '$lib/types/wp-types'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	export let data: PageData
	let editorBlocks: EditorBlock[], uri: string

	$: {
		;({ editorBlocks, uri } = data)
	}

	import type { PersonResponse, ActionData } from '$lib/types/types'

	export let form: ActionData
	

	const { temp } = data as PageData

	let isSubmitting = false
	let errorMessage = ''
</script>



{#each editorBlocks as block, index (block.clientId)}
<BlockRenderer {block} />
{/each}