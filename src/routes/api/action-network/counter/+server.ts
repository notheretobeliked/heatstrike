import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getCachedData } from '$lib/cache/subscriber-count'

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams
		const isDeployHook = searchParams.get('deploy') === 'true'

		// Get cached data (force fresh if deploy hook)
		const data = await getCachedData(isDeployHook)

		return json({
			total_subscribers: data.count,
			cached: data.cached,
			last_updated: data.timestamp,
			source: data.source
		})
	} catch (error) {
		console.error('Error fetching subscriber count:', error)
		return json(
			{
				error: 'Failed to fetch subscriber count',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		)
	}
}
