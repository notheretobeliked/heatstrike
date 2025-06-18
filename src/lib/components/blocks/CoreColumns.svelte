<script lang="ts">
	import type { CoreColumns } from '$lib/graphql/generated'
	import BlockRenderer from '$components/BlockRenderer.svelte'
	interface Props {
		block: CoreColumns;
	}

	let { block }: Props = $props();
	const isStackedOnMobile: boolean = block.attributes?.isStackedOnMobile ?? false
	
	// Create CSS grid template columns from individual column widths
	function getGridTemplateColumns(): string {
		return (block as any).children
			.map((child: any) => child.attributes?.width || '1fr')
			.join(' ');
	}
	
	// Get the grid style object
	function getGridStyle(): string {
		const gridTemplateColumns = getGridTemplateColumns();
		return `grid-template-columns: ${gridTemplateColumns};`;
	}
	
	// Get CSS classes for responsive behavior
	function getCssClasses(): string {
		const baseClasses = `${block.attributes?.className || ''} corecolumns grid`;
		return baseClasses.trim();
	}
</script>

<div
	class="{getCssClasses()}  gap-4"
	data-stacked={isStackedOnMobile}
	style={isStackedOnMobile ? `grid-template-columns: 1fr; --grid-columns: ${getGridTemplateColumns()};` : getGridStyle()}
>
	{#each (block as any).children as childBlock, index}
		<BlockRenderer block={childBlock} />
	{/each}
</div>

<style>
	@media (min-width: 768px) {
		.corecolumns[data-stacked="true"] {
			grid-template-columns: var(--grid-columns) !important;
		}
	}
</style>
