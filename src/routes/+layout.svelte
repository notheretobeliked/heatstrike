<script lang="ts">
	import '../app.css'
	import { page } from '$app/stores'
	import type { LayoutData } from './$types'
	import type { ImageObject } from '$lib/types/wp-types'
	import Twitter from '$components/SEO/Twitter.svelte'
	import OpenGraph from '$components/SEO/OpenGraph.svelte'
	import Header from '$components/Header.svelte'

	interface Props {
		data: LayoutData
		children?: import('svelte').Snippet
	}

	let { data, children }: Props = $props()
	let menuItems = $derived(data.menu.menuItems?.nodes)
	let image = $derived((data.seo.opengraphImage ?? null) as ImageObject | null)
	let metadescription = $derived((data.seo.metaDesc ?? '') as string)
	let pageTitle = $derived((data.seo.title ?? '') as string)
	let siteUrl = $derived((data.seo.opengraphUrl ?? '') as string)
	let siteTitle = $derived((data.seo.opengraphSiteName ?? '') as string)

	// Fetched client-side so the temperature stays live on prerendered pages
	// (a build-time value would otherwise be frozen until the next deploy).
	let temp = $state<number | null>(null)
	$effect(() => {
		fetch('/api/weather-data')
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data && typeof data.temperature === 'number') temp = data.temperature
			})
			.catch(() => {
				// Temperature is non-critical; leave the fallback in place.
			})
	})
</script>

{#key $page.url.pathname}
	<OpenGraph {image} {metadescription} {pageTitle} {siteTitle} {siteUrl} />
	<Twitter {image} {metadescription} {pageTitle} {siteUrl} />
{/key}

<div class="absolute md:fixed bottom-[45vh] md:bottom-[40vh] scale-75 md:scale-100 left-6 md:left-24 z-50">
	<div class="relative w-36 h-36">
		<svg
			class="w-full h-full"
			preserveAspectRatio="xMidYMid meet"
			viewBox="0 0 95 95"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M47.5 0L50.7674 5.95962L54.9321 0.587746L57.2262 6.98344L62.1747 2.32571L63.445 9.00579L69.0633 5.17596L69.2719 11.9761L75.4211 9.06899L74.5616 15.8186L81.0837 13.91L79.1814 20.4384L85.9247 19.5789L83.0239 25.7281L89.824 25.9367L85.9942 31.555L92.6743 32.819L88.0166 37.7737L94.4122 40.0679L89.0341 44.2326L95 47.5L89.0341 50.7674L94.4122 54.9321L88.0166 57.2262L92.6743 62.1747L85.9942 63.445L89.824 69.0633L83.0239 69.2719L85.9247 75.4211L79.1814 74.5616L81.0837 81.0837L74.5616 79.1814L75.4211 85.9247L69.2719 83.0239L69.0633 89.824L63.445 85.9942L62.1747 92.6743L57.2262 88.0166L54.9321 94.4122L50.7674 89.0341L47.5 95L44.2326 89.0341L40.0679 94.4122L37.7737 88.0166L32.819 92.6743L31.555 85.9942L25.9367 89.824L25.7281 83.0239L19.5789 85.9247L20.4384 79.1814L13.91 81.0837L15.8186 74.5616L9.06899 75.4211L11.9761 69.2719L5.17596 69.0633L9.00579 63.445L2.32571 62.1747L6.98344 57.2262L0.587746 54.9321L5.95962 50.7674L0 47.5L5.95962 44.2326L0.587746 40.0679L6.98344 37.7737L2.32571 32.819L9.00579 31.555L5.17596 25.9367L11.9761 25.7281L9.06899 19.5789L15.8186 20.4384L13.91 13.91L20.4384 15.8186L19.5789 9.06899L25.7281 11.9761L25.9367 5.17596L31.555 9.00579L32.819 2.32571L37.7737 6.98344L40.0679 0.587746L44.2326 5.95962L47.5 0Z"
				class="fill-caution stroke-extremecaution"
			/>
		</svg>
		<div class="absolute inset-0 flex items-center justify-center">
			<p class="-rotate-12 text-center px-7 text-sm leading-tight mb-0">
				10 Downing Street: <strong>{temp ?? '--'}°C</strong>
			</p>
		</div>
	</div>
</div>

{#key $page.url.pathname}
	<Header {menuItems} />
{/key}

<main id="main-content" class="md:px-0">
	{@render children?.()}
</main>
