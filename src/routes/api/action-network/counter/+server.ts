import { AN_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Cache storage
let cachedCount: number | null = null
let lastUpdated: number | null = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

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
			totalSubscribers += data._embedded['osdi:people'].length
		}

		nextPageUrl = data._links?.next?.href || null
	}

	return totalSubscribers
}

// Function to update cache in the background
async function updateCacheInBackground() {
	try {
		const newCount = await fetchTotalCount()
		cachedCount = newCount
		lastUpdated = Date.now()
	} catch (error) {
		console.error('Background cache update failed:', error)
	}
}

// Initialize cache on server start
updateCacheInBackground()

export const GET: RequestHandler = async () => {
	try {
		const now = Date.now()

		// If cache is expired, trigger background update
		if (!lastUpdated || now - lastUpdated > CACHE_DURATION) {
			// Don't await - let it update in background
			updateCacheInBackground()
		}

		// If we have a cached value, return it immediately
		if (cachedCount !== null) {
			return json({
				total_subscribers: cachedCount,
				cached: true,
				last_updated: lastUpdated
			})
		}

		// If no cached value exists yet (first load), we need to wait for the initial fetch
		const initialCount = await fetchTotalCount()
		cachedCount = initialCount
		lastUpdated = now

		return json({
			total_subscribers: initialCount,
			cached: false,
			last_updated: lastUpdated
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
