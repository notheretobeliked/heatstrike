import { json } from '@sveltejs/kit'
import { graphqlQuery } from '$lib/utilities/graphql'

const QUERY = `query SubscriberCount { subscriberCount }`

export async function GET() {
	try {
		const response = await graphqlQuery(QUERY, {})

		if (!response.ok) {
			return json({ error: 'Failed to fetch subscriber count' }, { status: 502 })
		}

		const body = await response.json()
		const count = body?.data?.subscriberCount ?? null

		return json(
			{ count },
			{
				headers: {
					// Cache at the edge so visitor traffic collapses into ~one origin
					// read per 5 min, regardless of how many people are on the site.
					'cache-control': 'public, s-maxage=300, stale-while-revalidate=600'
				}
			}
		)
	} catch (error) {
		console.error('Error fetching subscriber count:', error)
		return json({ error: 'Failed to fetch subscriber count' }, { status: 500 })
	}
}
