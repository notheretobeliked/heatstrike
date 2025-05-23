<script lang="ts">
	import { page } from '$app/stores'
	import type { MenuItem } from '$lib/types/wp-types'
	export let menuItems: MenuItem[]
	import Button from '$components/Button.svelte'
	import { Hamburger } from 'svelte-hamburgers'
	$: currentPagePath = $page.url.pathname
	$: menuItems = menuItems.map((item) => {
		// Normalize both paths to ensure consistent comparison
		const normalizedCurrentPath = currentPagePath.replace(/\/$/, '')
		const normalizedItemUri = item.uri.replace(/\/$/, '')
		return {
			...item,
			current: normalizedCurrentPath === normalizedItemUri
		}
	})

	let open = false

	function handleClick() {
		open = !open
	}
</script>

{#if menuItems.length > 0}
	<header class="fixed top-0 left-0 right-0 z-50">
		<nav class="w-full flex px-4 pt-4 justify-between items-center h-12 md:h-24">
			<div class="fixed inset-2 z-50 md:hidden">
				<Hamburger bind:open --color="black" type="spin" />
			</div>

			<ul
				role="navigation"
				aria-label="Main"
				class="{open
					? 'flex fixed z-[40] inset-0 w-screen h-screen align-center items-center bg-extremecaution'
					: 'hidden'} md:flex w-full flex-col gap-10 md:flex-row justify-center md:justify-end md:gap-4"
			>
				{#each menuItems as menuItem}
					<li>
						<Button
							active={menuItem.current}
							label={menuItem.label}
							url={menuItem.uri}
							colourClass="bg-caution"
							textColourClass="text-extremedanger"
						/>
					</li>
				{/each}
			</ul>
		</nav>
	</header>
{/if}
