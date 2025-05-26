<script lang="ts">
	import BlockHeadline from './atoms/BlockHeadline.svelte'
	import Button from './atoms/Button.svelte'
    let {url} = $props()

	type ChuffedData = {
		raised: string
		progressPercent: number
		campaignUrl: string
	}

	let loading = $state(true)
	let error = $state<string | null>(null)
	let data = $state<ChuffedData>({
		raised: '£0',
		progressPercent: 0,
		campaignUrl: ''
	})

	$effect(() => {
		fetchChuffedData()
	})

	async function fetchChuffedData() {
		loading = true
		error = null

		try {
			const response = await fetch(`/api/chuffed?url=${encodeURIComponent(url)}`)

			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.status}`)
			}

			data = await response.json()
		} catch (err) {
			console.error('Error fetching Chuffed data:', err)
			error = err instanceof Error ? err.message : 'Failed to load donation data'
		} finally {
			loading = false
		}
	}
</script>

<div class="w-full">
	<BlockHeadline label="DONATE TO CAN" primaryColour="yellow" secondaryColour="green" variant="two" />
	<div class="flex flex-col items-center gap-3 p-2">
		<p class="text-base text-left font-medium">You CAN hold the biggest environmental polluters to account by supporting Citizen's Arrest Network today.        </p>

		{#if loading}
			<div class="mt-4 animate-pulse flex flex-col items-center">
				<div class="h-4 w-full rounded-full bg-gray-200"></div>
				<div class="mt-2 h-4 w-24 rounded bg-gray-200"></div>
				<div class="mt-4 h-10 w-32 rounded bg-gray-200"></div>
			</div>
		{:else if error}
			<div class="mt-4 text-red-500 text-center">
				<p>{error}</p>
				<Button label="Try again" onclick={fetchChuffedData} />
			</div>
		{:else}
			<div class="bg-blue/20 mt-4 h-4 w-full rounded-full">
				<div class="bg-blue h-full rounded-full" style="width: {data.progressPercent}%"></div>
			</div>
			<p class="text-base text-center"><span class="font-bold">{data.raised}</span> raised</p>
			<Button 
				url={data.campaignUrl} 
				label="Donate now" 
				textClass="font-inter text-sm md:text-base"
				colourClass="bg-yellow"
				textColourClass="text-black"
			/>
		{/if}
	</div>
</div>
