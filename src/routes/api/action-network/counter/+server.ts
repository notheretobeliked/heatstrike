import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getCachedData, RateLimitError } from '$lib/cache/subscriber-count'

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams
		const isDeployHook = searchParams.get('deploy') === 'true'

		// Get cached data (force fresh if deploy hook)
		const data = await getCachedData(isDeployHook)

		const response = {
			total_subscribers: data.count,
			cached: data.cached,
			last_updated: data.timestamp,
			source: data.source
		}

		// Include retry information if rate limited
		if (data.retryAfter) {
			return json({
				...response,
				rate_limited: true,
				retry_after_seconds: data.retryAfter,
				message: 'API rate limited, serving cached data'
			})
		}

		return json(response)
	} catch (error) {
		console.error('Error fetching subscriber count:', error)
		
		// Handle rate limiting errors specifically
		if (error instanceof RateLimitError) {
			return json(
				{
					error: 'Rate limited and no cached data available',
					rate_limited: true,
					retry_after_seconds: error.retryAfter,
					details: error.message,
					message: 'Please try again later'
				},
				{ 
					status: 429,
					headers: error.retryAfter ? {
						'Retry-After': error.retryAfter.toString()
					} : {}
				}
			)
		}

		// Handle other errors
		return json(
			{
				error: 'Failed to fetch subscriber count',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		)
	}
}
