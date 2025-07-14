import { WORDPRESS_URL } from '$env/static/private'
export const prerender = true // Disable prerendering for preview functionality

import PageContent from '$lib/graphql/query/page.graphql?raw'
import PageContentWithPreview from '$lib/graphql/query/page-with-preview.graphql?raw'
import PreviewById from '$lib/graphql/query/preview-by-id.graphql?raw'
import { checkResponse, graphqlQuery } from '$lib/utilities/graphql'
import { checkWordPressAuth, canUserPreview } from '$lib/server/wordpress-auth'
import { error, isHttpError, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { EditorBlock } from '$lib/types/wp-types'
import { flatListToHierarchical } from '$lib/server/utilities'

export const load: PageServerLoad = async function load({ params, url, fetch, request }) {
	const uri = `/${params.all || ''}`.replace(/\/+/g, '/') // Normalize multiple slashes

	if (uri.match(/\.(jpg|png|gif|svg|css|js)$/i)) {
		error(404, 'Not a page route')
	}

	// Handle authentication for previews
	let authResult: { authenticated: boolean; token?: string } = { authenticated: false }

	try {
		let pageResponse: Response

		pageResponse = await graphqlQuery(PageContent, { uri: uri })


		checkResponse(pageResponse)
		const pageData = await pageResponse.json()

		// Handle GraphQL errors
		if (pageData.errors) {
			error(500, 'GraphQL query failed')
		}

		// Check if we have content
		const node = pageData?.data?.page || pageData?.data?.post || pageData?.data?.nodeByUri
		
		if (!node) {
			// For previews, try to be more helpful
			error(404, `Page not found for URI: ${uri}`)
		}


		let editorBlocks: EditorBlock[] = node?.editorBlocks
			? flatListToHierarchical(node.editorBlocks)
			: []

		return {
			data: pageData.data,
			uri: uri,
			editorBlocks: editorBlocks,
			authenticated: authResult.authenticated,

		}
	} catch (err: unknown) {
		// Check if it's already an HTTP error (like a 404)
		if (isHttpError(err)) {
			throw err
		}
		
		// Check if it's a response with status
		if (err instanceof Response) {
			const status = err.status
			if (status === 404) {
				error(404, `Page not found for URI: ${uri}`)
			}
			error(status || 500, `Error fetching page: ${await err.text()}`)
		}
		
		// For errors with status property (from GraphQL or other sources)
		const httpError = err as { status?: number; message?: string }
		if (httpError.status === 404 || 
		    (httpError.message && httpError.message.includes('not found'))) {
			error(404, httpError.message || `Page not found for URI: ${uri}`)
		}
		
		// For any other error
		const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'
		error(500, errorMessage)
	}
}