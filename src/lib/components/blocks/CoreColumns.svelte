<script lang="ts">
	import type { CoreColumns } from '$lib/graphql/generated'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	interface Props {
		block: CoreColumns;
	}

	let { block }: Props = $props();
	const columns = block.children.length
	const isStackedOnMobile: boolean = block.attributes?.isStackedOnMobile ?? false
	
	// Helper function to get the appropriate grid columns class
	function getGridColsClass(cols: number): string {
		switch (cols) {
			case 2: return 'grid-cols-2';
			case 3: return 'grid-cols-3';
			case 4: return 'grid-cols-4';
			case 5: return 'grid-cols-5';
			case 6: return 'grid-cols-6';
			default: return 'grid-cols-1';
		}
	}
	
	function getMdGridColsClass(cols: number): string {
		switch (cols) {
			case 2: return 'md:grid-cols-2';
			case 3: return 'md:grid-cols-3';
			case 4: return 'md:grid-cols-4';
			case 5: return 'md:grid-cols-5';
			case 6: return 'md:grid-cols-6';
			default: return 'md:grid-cols-1';
		}
	}
</script>

<div
	class="{block.attributes?.className} grid {isStackedOnMobile ? `grid-cols-1 ${getMdGridColsClass(columns)}` : getGridColsClass(columns)}  corecolumns"
>
	{#each block.children as block, index}
		<BlockRenderer {block} />
	{/each}
</div>
