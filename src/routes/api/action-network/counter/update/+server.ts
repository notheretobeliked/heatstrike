import { AN_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Function to fetch the total count
async function fetchTotalCount(): Promise<number> {
	let totalSubscribers = 0
	let nextPageUrl = 'https://actionnetwork.org/api/v2/people'

	while (nextPageUrl) {
		const response = await fetch(nextPageUrl, {
			headers: {
				'OSDI-API-Token': AN_KEY,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`)
		}

		const data = await response.json()

		if (data._embedded && data._embedded['osdi:people']) {
			// Filter to only count people with subscribed email status
			const subscribedPeople = data._embedded['osdi:people'].filter((person: any) => {
				return person.email_addresses && person.email_addresses.some((email: any) => 
					email.status === 'subscribed'
				)
			})
			totalSubscribers += subscribedPeople.length
		}

		nextPageUrl = data._links?.next?.href || null
	}

	return totalSubscribers
}

export const GET: RequestHandler = async () => {
	try {
		// This endpoint is called by Vercel cron job
		const count = await fetchTotalCount()
		const timestamp = Date.now()
		
		return json({
			success: true,
			count,
			timestamp,
			message: 'Count fetched successfully'
		})
	} catch (error) {
		console.error('Error fetching subscriber count:', error)
		return json(
			{
				error: 'Failed to fetch count',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		)
	}
} 