<script lang="ts">
	import type { CoreFootnotes } from '$lib/graphql/generated'
	
	let { block } = $props<{ block: CoreFootnotes }>();
</script>

{#if block.renderedHtml}<div class="footnotes border-t border-black mt-9 py-3">
		{@html block.renderedHtml}
	</div>{/if}

<style lang="postcss">
	.footnotes :global(ol) {
		list-style: none;
		margin-left: 1rem;  /* Add positive margin to offset the negative margin on list items */
	}

	.footnotes :global(li) {
		margin-left: -1rem;  /* Use negative margin instead of padding */
		text-indent: 1rem;
		overflow-wrap: break-word;
		word-wrap: break-word;
		hyphens: auto;
	}

	.footnotes :global(li::before) {
		content: counter(list-item) '— ';
	}
</style>
