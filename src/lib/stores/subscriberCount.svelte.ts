import { browser } from '$app/environment'

const STORAGE_KEY = 'subscriberCount'
const STORAGE_BUMP_KEY = 'subscriberCountBumpAt'
// How long an optimistic bump is protected from being undone by a stale poll
// (the backend/edge cache may lag a few minutes behind a just-made signup).
const BUMP_GRACE_MS = 10 * 60 * 1000

// Shared, reactive count. `null` until we have a real value, so components can fall
// back to their build-time number for first paint (and avoid hydration mismatch).
const store = $state<{ value: number | null }>({ value: null })
let lastBumpAt = 0

function persistCount(n: number): void {
	if (browser) localStorage.setItem(STORAGE_KEY, String(n))
}

function persistBumpAt(ts: number): void {
	if (!browser) return
	if (ts > 0) localStorage.setItem(STORAGE_BUMP_KEY, String(ts))
	else localStorage.removeItem(STORAGE_BUMP_KEY)
}

export const subscriberCount = store

/**
 * Seed the count AND the bump timestamp from localStorage (first paint after a full
 * reload). Restoring the timestamp is what keeps the grace window alive across reloads —
 * otherwise the first poll would overwrite a just-made optimistic bump. No-op for the
 * value once we already hold one in memory (that survives client-side navigation).
 */
export function hydrateSubscriberCount(): void {
	if (!browser) return

	if (lastBumpAt === 0) {
		const ts = Number(localStorage.getItem(STORAGE_BUMP_KEY))
		if (!Number.isNaN(ts) && ts > 0) lastBumpAt = ts
	}

	if (store.value !== null) return
	const raw = localStorage.getItem(STORAGE_KEY)
	if (raw === null || raw === '') return
	const n = Number(raw)
	if (!Number.isNaN(n)) store.value = n
}

/**
 * Optimistic +1 after a confirmed-new signup. Updates immediately and persists (count +
 * timestamp), so it survives navigation/reload until a poll replaces it. Skipped if we
 * have no base value yet (don't invent a count of 1 — the next poll shows the real one).
 */
export function bumpSubscriberCount(): void {
	hydrateSubscriberCount()
	if (store.value === null) return
	store.value += 1
	lastBumpAt = Date.now()
	persistCount(store.value)
	persistBumpAt(lastBumpAt)
}

/**
 * Authoritative value from the API poll. Wins — except it won't drop the number back
 * below a very recent optimistic bump that the backend/edge cache hasn't caught up to.
 * Once an authoritative value confirms (>= current) we clear the grace marker.
 */
export function setSubscriberCountFromPoll(n: number): void {
	if (store.value !== null && n < store.value && Date.now() - lastBumpAt < BUMP_GRACE_MS) {
		return // stale poll lagging behind a recent optimistic bump — keep the higher value
	}
	store.value = n
	persistCount(n)
	// The authoritative count caught up (or moved on); the bump is confirmed — drop the grace.
	lastBumpAt = 0
	persistBumpAt(0)
}
