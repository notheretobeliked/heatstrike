import { dev } from '$app/environment'
import { updateCacheInBackground } from '$lib/cache/subscriber-count'

// Warm the cache on server start (including deployments)
if (!dev) {
	console.log('Production environment detected - warming subscriber count cache...')
	updateCacheInBackground()
} 