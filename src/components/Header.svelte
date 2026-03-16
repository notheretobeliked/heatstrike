<script lang="ts">
	import { Hamburger } from 'svelte-hamburgers'
	import { page } from '$app/stores'
	import ProjectButton from '$components/atoms/ProjectButton.svelte'

	interface MenuItem {
		label?: string | null
		order?: number | null
		uri?: string | null
	}

	interface Props {
		menuItems?: MenuItem[]
		siteTitle?: string
	}

	let { menuItems = [], siteTitle = 'Heat Strike' }: Props = $props()

	const normalizePath = (path: string) => {
		if (path === '/') return path
		return path.endsWith('/') ? path.slice(0, -1) : path
	}

	const isCurrent = (itemUri: string | null | undefined) => {
		if (!itemUri) return false
		return normalizePath($page.url.pathname) === normalizePath(itemUri)
	}

	let open: boolean = $state(false)
</script>

<a href="#main-content" class="skip-link">Skip to content</a>

{#if menuItems.length > 0}
	<header class="fixed top-0 left-0 right-0 z-50">
		<nav class="w-full flex px-4 pt-4 justify-between items-center h-12 md:h-24">
			<div class="fixed left-2 top-2 z-50 md:hidden">
				<Hamburger bind:open --color="black" type="spin" />
			</div>

			<ul
				role="navigation"
				aria-label="Main"
				class="{open
					? 'flex fixed z-[40] inset-0 w-screen h-screen align-center items-center bg-extremecaution'
					: 'hidden'} md:flex w-full flex-col gap-10 md:flex-row justify-center md:justify-end md:gap-4 list-none"
			>
				{#each menuItems as menuItem}
					<li>
						<ProjectButton
							active={isCurrent(menuItem.uri)}
							label={menuItem.label ?? ''}
							url={menuItem.uri ?? '/'}
							colourClass="bg-caution"
							textColourClass="text-extremedanger"
							onclick={() => (open = false)}
						/>
					</li>
				{/each}
			</ul>
		</nav>
	</header>
{/if}

<style>
	:global(.hamburger) {
		--layer-height: 1.5px;
	}

	.skip-link {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 999;
		padding: 0.5rem 1rem;
		background: black;
		color: white;
		text-decoration: none;
	}

	.skip-link:focus {
		left: 0;
	}
</style>
