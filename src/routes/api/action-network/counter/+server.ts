import { AN_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Cache storage (in-memory)
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

// Function to update cache in the background
async function updateCacheInBackground() {
	try {
		const newCount = await fetchTotalCount()
		cachedCount = newCount
		lastUpdated = Date.now()
		console.log(`Cache updated: ${newCount} subscribers at ${new Date().toISOString()}`)
	} catch (error) {
		console.error('Background cache update failed:', error)
	}
}

// Initialize cache on server start
updateCacheInBackground()

export const GET: RequestHandler = async () => {
	try {
		const now = Date.now()

		// If in-memory cache is valid, use it
		if (cachedCount !== null && lastUpdated && now - lastUpdated < CACHE_DURATION) {
			return json({
				total_subscribers: cachedCount,
				cached: true,
				last_updated: lastUpdated,
				source: 'memory'
			})
		}

		// If cache is expired, trigger background update
		if (!lastUpdated || now - lastUpdated > CACHE_DURATION) {
			// Don't await - let it update in background
			updateCacheInBackground()
		}

		// If we have a cached value (even if expired), return it immediately
		if (cachedCount !== null) {
			return json({
				total_subscribers: cachedCount,
				cached: true,
				last_updated: lastUpdated,
				source: 'memory_expired'
			})
		}

		// If no cached value exists yet (first load), we need to wait for the initial fetch
		const initialCount = await fetchTotalCount()
		const timestamp = now
		
		// Update cache
		cachedCount = initialCount
		lastUpdated = timestamp

		return json({
			total_subscribers: initialCount,
			cached: false,
			last_updated: timestamp,
			source: 'fresh'
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
