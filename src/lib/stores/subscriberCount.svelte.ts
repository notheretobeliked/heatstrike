import { browser } from '$app/environment'

const STORAGE_KEY = 'subscriberCount'
// How long an optimistic bump is protected from being undone by a stale poll
// (the backend/edge cache may lag a few minutes behind a just-made signup).
const BUMP_GRACE_MS = 10 * 60 * 1000

// Shared, reactive count. `null` until we have a real value, so components can fall
// back to their build-time number for first paint (and avoid hydration mismatch).
const store = $state<{ value: number | null }>({ value: null })
let lastBumpAt = 0

function persist(n: number): void {
	if (browser) localStorage.setItem(STORAGE_KEY, String(n))
}

export const subscriberCount = store

/**
 * Seed the count from localStorage (first paint after a full reload). No-op once we
 * already hold a value in memory — that survives client-side navigation on its own,
 * which is what keeps an optimistic bump visible as the user moves between pages.
 */
export function hydrateSubscriberCount(): void {
	if (!browser || store.value !== null) return
	const raw = localStorage.getItem(STORAGE_KEY)
	if (raw === null || raw === '') return
	const n = Number(raw)
	if (!Number.isNaN(n)) store.value = n
}

/**
 * Optimistic +1 after a confirmed-new signup. Updates immediately and persists, so it
 * survives navigation/reload until a poll replaces it. Skipped if we have no base value
 * yet (don't want to invent a count of 1 — the next poll will show the real number).
 */
export function bumpSubscriberCount(): void {
	hydrateSubscriberCount()
	if (store.value === null) return
	store.value += 1
	lastBumpAt = Date.now()
	persist(store.value)
}

/**
 * Authoritative value from the API poll. Wins — except it won't drop the number back
 * below a very recent optimistic bump that the backend/edge cache hasn't caught up to.
 */
export function setSubscriberCountFromPoll(n: number): void {
	if (store.value !== null && n < store.value && Date.now() - lastBumpAt < BUMP_GRACE_MS) {
		return
	}
	store.value = n
	persist(n)
}
