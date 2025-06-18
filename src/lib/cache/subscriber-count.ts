import { AN_KEY } from '$env/static/private'

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

// Function to force update cache
async function forceUpdateCache(): Promise<{ count: number; timestamp: number }> {
	const newCount = await fetchTotalCount()
	const timestamp = Date.now()
	cachedCount = newCount
	lastUpdated = timestamp
	console.log(`Force cache update: ${newCount} subscribers at ${new Date().toISOString()}`)
	return { count: newCount, timestamp }
}

// Function to get cached data
async function getCachedData(forceFresh = false): Promise<{
	count: number;
	timestamp: number;
	cached: boolean;
	source: string;
}> {
	const now = Date.now()

	// If forcing fresh data
	if (forceFresh) {
		const { count, timestamp } = await forceUpdateCache()
		return {
			count,
			timestamp,
			cached: false,
			source: 'force_fresh'
		}
	}

	// If in-memory cache is valid, use it
	if (cachedCount !== null && lastUpdated && now - lastUpdated < CACHE_DURATION) {
		return {
			count: cachedCount,
			timestamp: lastUpdated,
			cached: true,
			source: 'memory'
		}
	}

	// If cache is expired, trigger background update
	if (!lastUpdated || now - lastUpdated > CACHE_DURATION) {
		// Don't await - let it update in background
		updateCacheInBackground()
	}

	// If we have a cached value (even if expired), return it immediately
	if (cachedCount !== null) {
		return {
			count: cachedCount,
			timestamp: lastUpdated!,
			cached: true,
			source: 'memory_expired'
		}
	}

	// If no cached value exists yet (first load), we need to wait for the initial fetch
	const initialCount = await fetchTotalCount()
	const timestamp = now
	
	// Update cache
	cachedCount = initialCount
	lastUpdated = timestamp

	return {
		count: initialCount,
		timestamp,
		cached: false,
		source: 'fresh'
	}
}

// Initialize cache on module load
updateCacheInBackground()

export { getCachedData, forceUpdateCache, updateCacheInBackground } 