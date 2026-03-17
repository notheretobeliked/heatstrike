<!-- A simple form to search for WhatsApp groups by postcode -->
<script lang="ts">
	import { debounce } from 'lodash-es'
	import ProjectButton from '$components/atoms/ProjectButton.svelte'

	let postcode = $state('')
	let result: { region: string; whatsappLink: string } | null = $state(null)
	let error: string | null = $state(null)
	let loading = $state(false)

	// Debounced search function that only triggers after user stops typing for 300ms
	const searchPostcode = debounce(async (query: string) => {
		if (query.length < 2) {
			result = null
			error = null
			return
		}

		loading = true
		error = null

		try {
			const response = await fetch(`/api/whatsapp-finder?postcode=${encodeURIComponent(query)}`)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to find WhatsApp group')
			}

			result = data
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred'
			result = null
		} finally {
			loading = false
		}
	}, 300)

	// Watch for changes in the postcode input
	$effect(() => {
		searchPostcode(postcode)
	})
</script>

<div class="bg-extremecaution w-screen min-h-[40vh] py-8 flex items-center">
	<h1
		class="fluid-text-lg font-anton uppercase text-extremedanger mb-8 text-center w-full md:px-14"
	>
		Find Your Local Heat Strike Group
	</h1>
</div>
<div class="w-full min-h-screen bg-caution">
	<div class="container mx-auto px-4 py-8 max-w-2xl">
		<div class="mb-8">
			<label for="postcode" class="block text-sm font-medium text-gray-700 mb-2">
				Enter your postcode
			</label>
			<input
				type="text"
				id="postcode"
				bind:value={postcode}
				placeholder="e.g. SW1A 1AA"
				class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
			/>
		</div>

		{#if loading}
			<div class="text-center text-gray-600">Searching...</div>
		{:else if error}
			<div class="p-4 bg-red-50 text-red-700 rounded-md">
				{error}
			</div>
		{:else if result}
			<div class="bg-white p-6 rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4">Your local group is in {result.region}</h2>

				{#if result.whatsappLink}
					<ProjectButton
						label="Join Whatsapp group"
						url={result.whatsappLink}
						colourClass="bg-caution"
						textColourClass="text-extremedanger"
					/>
				{:else}
					<p class="text-gray-600">No WhatsApp group available for this region yet.</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Add any custom styles here if needed */
</style>