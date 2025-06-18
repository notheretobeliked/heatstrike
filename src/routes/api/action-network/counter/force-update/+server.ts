import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { forceUpdateCache } from '$lib/cache/subscriber-count'

export const POST: RequestHandler = async () => {
	try {
		console.log('Force update triggered - fetching fresh data')
		const { count, timestamp } = await forceUpdateCache()
		
		return json({
			success: true,
			count,
			timestamp,
			message: 'Force update completed successfully'
		})
	} catch (error) {
		console.error('Error in force update:', error)
		return json(
			{
				error: 'Failed to force update',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		)
	}
} 