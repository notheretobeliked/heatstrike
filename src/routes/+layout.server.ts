import PageMeta from '$lib/graphql/query/menu.graphql?raw'
import type { PageMetaQuery } from '$lib/graphql/generated'
import { checkResponse, graphqlQuery } from '$lib/utilities/graphql'
import type { LayoutServerLoad } from './$types'
import { error, isHttpError } from '@sveltejs/kit'
import { PUBLIC_SITE_URL } from '$env/static/public' // Ensure this import is correct

interface LoadReturn {
	data: PageMetaQuery
	menu: NonNullable<PageMetaQuery['menu']>
	seo: NonNullable<NonNullable<PageMetaQuery['page']>['seo']>
	uri: string
	temp: number | null
}

export const load: LayoutServerLoad<LoadReturn> = async function load({ params, url, fetch }) {
	let uri = url.pathname
	// Remove language prefix from URI before making the GraphQL query	
	if (uri === '') {
		uri = '/'
	}

	let temp: number | null = null;

	try {
		// Fetch temperature data using event.fetch
		const tempResponse = await fetch('/api/weather-data');
		if (tempResponse.ok) {
			const tempData = await tempResponse.json();
			temp = tempData.temperature;
		}

		const response = await graphqlQuery(PageMeta, { uri: uri })
		checkResponse(response)

		const { data }: { data: PageMetaQuery } = await response.json()

		// Modify menu items to add 'current' key
		if (data.menu?.menuItems?.nodes) {
			data.menu.menuItems.nodes = data.menu.menuItems.nodes.map((node) => ({
				...node,
				current: node.uri?.replace(/\/$/, '') === uri?.replace(/\/$/, '')
			}))
		}

		if (!data.menu) {
			console.error('Menu data check failed:', data.menu)
			error(500, 'Missing menu data')
		}

		// Check if page data is null, but DON'T throw a 404 here
		// Let the +page.server.ts handle 404s for missing pages
		if (!data.page) {
			console.log('Page not found in layout.server.ts, but continuing to let +page.server.ts handle it')
		}

		// Handle SEO data more gracefully
		let seoData = data.page?.seo
		
		if (seoData?.opengraphUrl) {
			const siteUrl = seoData.opengraphUrl.replace(
				new URL(seoData.opengraphUrl).origin,
				PUBLIC_SITE_URL
			)
			seoData = { ...seoData, opengraphUrl: siteUrl }
		} else {
			// Provide fallback SEO data
			seoData = {
				title: 'Citizen\'s Arrest Network',
				metaDesc: 'Citizen\'s Arrest Network will hold those making the decisions driving the worst environmental pollution to account.',
				opengraphUrl: `${PUBLIC_SITE_URL}${uri}`,
				opengraphImage: null
				// Add other required SEO fields with default values
			}
		}

		return {
			data,
			menu: data.menu,
			seo: seoData,
			uri,
			temp,
		} satisfies LoadReturn
	} catch (err: unknown) {
		console.error('Caught error in layout.server.ts:', err);
		
		// Check if this is a 404 error from +page.server.ts and let it propagate
		if (isHttpError(err) && err.status === 404) {
			console.log('Propagating 404 error from +page.server.ts');
			throw err; // Re-throw the 404 error
		}
		
		// For other HTTP errors
		if (isHttpError(err)) {
			console.log(`Handling HTTP error: ${err.status} - ${err.body?.message}`);
			throw err; // Re-throw the original error
		}
		
		if (err instanceof Response) {
			const status = err.status || 500;
			const message = await err.text();
			console.log(`Handling Response error: ${status} - ${message}`);
			error(status, message);
		}
		
		// For any other type of error
		const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
		console.log(`Handling generic error: ${errorMessage}`);
		error(500, errorMessage);
	}
}
