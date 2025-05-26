import { GRAPHQL_ENDPOINT } from '$env/static/private'
import { error } from '@sveltejs/kit'

export function checkResponse(response: Response) {
	const { headers, ok } = response
	if (!ok) {
		error(502, 'Bad Gateway')
	}

	if (!headers.get('content-type')?.includes('application/json')) {
		error(502, 'Bad Gateway: expected JSON data from GraphQL backend')
	}
}

export async function graphqlQuery<TData = any, TVariables = any>(
	query: string,
	variables: TVariables,
	options?: {
		includeAuth?: boolean
		request?: Request
		token?: string
	}
): Promise<Response> {
	const headers: Record<string, string> = {
		'content-type': 'application/json'
	}

	// If we have a preview token, use it instead of cookies
	if (options?.token) {
		headers['X-Preview-Token'] = options.token
	} else if (options?.includeAuth && options?.request) {
		// Fallback to cookie forwarding if no token
		const cookieHeader = options.request.headers.get('cookie')
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader
		}
	}

	return fetch(GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			query,
			variables
		}),
		cache: 'no-cache' // This tells the fetch to bypass the cache
	})
}
