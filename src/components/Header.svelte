<script lang="ts">
	import { page } from '$app/stores'
	import type { MenuItem } from '$lib/types/wp-types'
	export let menuItems: MenuItem[]
	import Button from '$components/Button.svelte'
	import { Hamburger } from 'svelte-hamburgers'
	$: currentPagePath = $page.url.pathname
	$: menuItems = menuItems.map((item) => ({
		...item,
		// Update 'active' or any other relevant property based on the current path
		current: currentPagePath === item.uri
	}))

	let open: boolean = false
</script>

{#if menuItems.length > 0}
	<header>
		<nav class="w-full flex px-4 pt-4 justify-between items-center h-12 md:h-24 absolute">
			
			<ul
				role="navigation"
				aria-label="Main"
				class="w-full flex flex-row justify-end"
			>
				{#each menuItems as menuItem}
					<li >
						<Button active={menuItem.current} label={menuItem.label} url={menuItem.uri} colourClass="bg-caution" textColourClass="text-extremedanger" />
					</li>
				{/each}
			</ul>
		</nav>
	</header>
{/if}
