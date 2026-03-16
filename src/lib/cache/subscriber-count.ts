import { AN_KEY } from '$env/static/private'

// Cache storage
let cachedCount: number | null = null
let lastUpdated: number | null = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// Custom error class for rate limiting
class RateLimitError extends Error {
	public retryAfter?: number

	constructor(message: string, retryAfter?: number) {
		super(message)
		this.name = 'RateLimitError'
		this.retryAfter = retryAfter
	}
}

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
			if (response.status === 429) {
				// Check for Retry-After header
				const retryAfter = response.headers.get('Retry-After')
				const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined

				console.log('Rate limited by Action Network API', {
					status: response.status,
					retryAfter: retryAfterSeconds ? `${retryAfterSeconds} seconds` : 'not specified'
				})

				throw new RateLimitError(`Rate limited: ${response.status}`, retryAfterSeconds)
			}
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
		if (error instanceof RateLimitError) {
			console.log('Background cache update rate limited, keeping existing cache')
		} else {
			console.error('Background cache update failed:', error)
		}
	}
}

// Function to force update cache
async function forceUpdateCache(): Promise<{ count: number; timestamp: number; retryAfter?: number }> {
	try {
		const newCount = await fetchTotalCount()
		const timestamp = Date.now()
		cachedCount = newCount
		lastUpdated = timestamp
		console.log(`Force cache update: ${newCount} subscribers at ${new Date().toISOString()}`)
		return { count: newCount, timestamp }
	} catch (error) {
		if (error instanceof RateLimitError) {
			// If we have cached data, return it instead of throwing
			if (cachedCount !== null && lastUpdated) {
				console.log('Force update rate limited, returning cached data')
				return {
					count: cachedCount,
					timestamp: lastUpdated,
					retryAfter: error.retryAfter
				}
			}
		}
		// Re-throw if it's not a rate limit error or we have no cached data
		throw error
	}
}

// Function to get cached data
async function getCachedData(forceFresh = false): Promise<{
	count: number;
	timestamp: number;
	cached: boolean;
	source: string;
	retryAfter?: number;
}> {
	const now = Date.now()

	// If forcing fresh data
	if (forceFresh) {
		try {
			const result = await forceUpdateCache()
			return {
				count: result.count,
				timestamp: result.timestamp,
				cached: false,
				source: result.retryAfter ? 'force_fresh_rate_limited' : 'force_fresh',
				retryAfter: result.retryAfter
			}
		} catch (error) {
			// If force fresh fails and we have cached data, return it
			if (cachedCount !== null && lastUpdated) {
				return {
					count: cachedCount,
					timestamp: lastUpdated,
					cached: true,
					source: 'fallback_cache_due_to_error'
				}
			}
			// If no cached data, re-throw the error
			throw error
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

	// Cache updates are only done via cron job or manual triggers
	// No automatic background updates to avoid rate limiting

	// If we have a cached value (even if expired), return it immediately
	if (cachedCount !== null) {
		return {
			count: cachedCount,
			timestamp: lastUpdated!,
			cached: true,
			source: 'memory_expired'
		}
	}

	// If no cached value exists yet (first load), return a default value
	// The cache will only be populated by the cron job or manual updates
	return {
		count: 1000000, // Default fallback value
		timestamp: now,
		cached: false,
		source: 'default_fallback'
	}
}

// NOTE: Cache is only updated when explicitly requested via API endpoints
// No automatic background updates to avoid rate limiting issues

export { getCachedData, forceUpdateCache, updateCacheInBackground, RateLimitError }