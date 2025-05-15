<script lang="ts">
	import '../app.css'
	import { page } from '$app/stores'
	import type { PageData } from './$types'
	import Twitter from '$components/SEO/Twitter.svelte'
	import OpenGraph from '$components/SEO/OpenGraph.svelte'
	import Header from '$components/Header.svelte'
	export let data: PageData
	let { seo, menu, uri } = data

	const menuItems = menu?.menuItems?.nodes ?? []
	
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

{#key $page.url.pathname}
	<Header {menuItems} />
{/key}

<slot />
