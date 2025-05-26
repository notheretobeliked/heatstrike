<script lang="ts">
	import '../app.css'
	import { page } from '$app/stores'
	import type { MenuItem } from '$lib/types/wp-types'
	import Twitter from '$components/SEO/Twitter.svelte'
	import OpenGraph from '$components/SEO/OpenGraph.svelte'
	import Header from '$components/Header.svelte'
	
	export let data: {
		seo: any;
		menu: { menuItems?: { nodes: MenuItem[] } | null };
		uri: string;
		temp: number | null;
	}
	
	let { seo, menu, uri, temp } = data

	// Get base menu items
	const baseMenuItems = menu?.menuItems?.nodes ?? []
	
	// Reactive menu items with current page tracking
	$: menuItems = baseMenuItems.map((item: MenuItem) => ({
		...item,
		current: item.uri?.replace(/\/$/, '') === $page.url.pathname?.replace(/\/$/, '')
	}))
	
	// Only set SEO variables if seo object exists
	const hasSeoData = !!seo
	const image = hasSeoData ? seo.opengraphImage : null
	const metadescription = hasSeoData ? seo.metaDesc : ''
	const pageTitle = hasSeoData ? seo.title : ''
	const siteUrl = hasSeoData ? seo.opengraphUrl : ''
	const siteTitle = hasSeoData ? seo.opengraphSiteName : ''

	$: {
		menuItems
		uri
		seo
	}

</script>

{#key $page.url.pathname}
	{#if hasSeoData}
		<OpenGraph {image} {metadescription} {pageTitle} {siteTitle} {siteUrl} />
		<Twitter {image} {metadescription} {pageTitle} {siteUrl} />
	{/if}
{/key}
<div class="absolute md:fixed bottom-[45vh] md:bottom-[40vh] scale-75 md:scale-100 left-6 md:left-24 z-50">
	<div class="relative w-36 h-36">
		<svg
			class="w-full h-full"
			preserveAspectRatio=preserveAspectRatio
			viewBox="0 0 95 95"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M47.5 0L50.7674 5.95962L54.9321 0.587746L57.2262 6.98344L62.1747 2.32571L63.445 9.00579L69.0633 5.17596L69.2719 11.9761L75.4211 9.06899L74.5616 15.8186L81.0837 13.91L79.1814 20.4384L85.9247 19.5789L83.0239 25.7281L89.824 25.9367L85.9942 31.555L92.6743 32.819L88.0166 37.7737L94.4122 40.0679L89.0341 44.2326L95 47.5L89.0341 50.7674L94.4122 54.9321L88.0166 57.2262L92.6743 62.1747L85.9942 63.445L89.824 69.0633L83.0239 69.2719L85.9247 75.4211L79.1814 74.5616L81.0837 81.0837L74.5616 79.1814L75.4211 85.9247L69.2719 83.0239L69.0633 89.824L63.445 85.9942L62.1747 92.6743L57.2262 88.0166L54.9321 94.4122L50.7674 89.0341L47.5 95L44.2326 89.0341L40.0679 94.4122L37.7737 88.0166L32.819 92.6743L31.555 85.9942L25.9367 89.824L25.7281 83.0239L19.5789 85.9247L20.4384 79.1814L13.91 81.0837L15.8186 74.5616L9.06899 75.4211L11.9761 69.2719L5.17596 69.0633L9.00579 63.445L2.32571 62.1747L6.98344 57.2262L0.587746 54.9321L5.95962 50.7674L0 47.5L5.95962 44.2326L0.587746 40.0679L6.98344 37.7737L2.32571 32.819L9.00579 31.555L5.17596 25.9367L11.9761 25.7281L9.06899 19.5789L15.8186 20.4384L13.91 13.91L20.4384 15.8186L19.5789 9.06899L25.7281 11.9761L25.9367 5.17596L31.555 9.00579L32.819 2.32571L37.7737 6.98344L40.0679 0.587746L44.2326 5.95962L47.5 0Z"
				class="fill-caution stroke-extremecaution"
			/>
		</svg>
		<p class="-rotate-12 w-36 top-10 text-center absolute px-7">
			10 Downing Street: <strong>{temp ?? '--'}°C</strong>
		</p>
	</div>
</div>

{#key $page.url.pathname}
	<Header {menuItems} />
{/key}

<slot />
