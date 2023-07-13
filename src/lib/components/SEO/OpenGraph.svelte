<script lang="ts">
  type Image = {
    url: string
    alt: string
  }
	export let image: Image
	export let squareImage: Image
	export let metadescription:string
	export let ogLanguage:string = 'en_UK'
	export let pageTitle:string
	export let siteTitle:string = "Surround Parliament"
	export let siteUrl:string
</script>

<svelte:head>
  <meta name="keywords" content="Surround Parliament, activism, cost of living, protest, anti-government, Just Stop Oil, Extinction Rebellion, Greenpeace, RSPB, RMT, Royal College of Nurses, Rishi Sunak, civil disobedience, Suffragettes, MLK, Berlin Wall, London, United Kingdom "/>
	<meta name="description" content={metadescription} />

  <meta property="og:site_name" content={siteTitle} />
	<meta property="og:locale" content={ogLanguage} />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:type" content='website' />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={metadescription} />
	{#if image}
		<meta property="og:image" content={image.url} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="627" />
		<meta property="og:image:alt" content={image.alt} />
	{/if}
	{#if squareImage}
		<meta property="og:image" content={squareImage.url} />
		<meta property="og:image:width" content="400" />
		<meta property="og:image:height" content="400" />
		<meta property="og:image:alt" content={image.alt} />
	{/if}
</svelte:head>
