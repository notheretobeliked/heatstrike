<script lang="ts">
	import type { EditorBlock } from '$types/wp-types'
	import BlockRenderer from '$components/BlockRenderer.svelte'
    import Signup from '$components/Signup.svelte';
	export let block: EditorBlock
	const children: EditorBlock[] = block.children ?? []

	const bgColor = block.attributes.backgroundColor ?? ''
    console.log(block)
</script>

<div class="px-2 md:px-0">
	<div class="m-auto {bgColor === 'black' && '!text-white'}">
		{#each children as block, index}
			<BlockRenderer {block} />
		{/each}
	</div>
    <Signup />

</div>
