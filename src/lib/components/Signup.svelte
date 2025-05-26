<script lang="ts">
	import { slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import Button from '../components/atoms/Button.svelte'

	let { formId = '1e49bee5-7886-4cc3-9ab5-b987ccce6139', additionalFields = [] } = $props<{
		formId?: string;
		additionalFields?: string[];
	}>();

	type FormField = {
		name: string // Original name with spaces (for Action Network)
		htmlName: string // Sanitized name for HTML attributes
		type: string
		required: boolean
		placeholder?: string
		options?: string[]
	}

	let fields = $state<FormField[]>([]);
	let isFocused = $state(false);
	let isLoading = $state(false);
	let isSubmitted = $state(false);
	let errorMessage = $state('');
	let formData = $state<Record<string, any>>({});
	let isTradeUnionMember = $state(false);
	let submissionResult = $state<{ region?: string; whatsappLink?: string } | null>(null);

	// Group fields for better organization
	let fieldGroups = $state({
		personal: [] as FormField[],
		contact: [] as FormField[],
		union: [] as FormField[],
		other: [] as FormField[]
	});

	function handleCheckboxChange(event: Event) {
		const checkbox = event.target as HTMLInputElement
		if (checkbox.name === 'trade_union_member') {
			isTradeUnionMember = checkbox.checked
		}
	}

	onMount(async () => {
		try {
			const queryParams = new URLSearchParams({
				formId,
				...(additionalFields.length > 0 && {
					additionalFields: additionalFields.join(',')
				})
			})

			const response = await fetch(`/api/action-network/form?${queryParams}`)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error)
			}

			fields = data.fields.map((field: FormField) => ({
				...field,
				name: field.name,
				htmlName: field.htmlName
			}))

			// Reorganize field groups
			const personalFieldNames = ['firstname', 'lastname', 'email']
			const contactFieldNames = ['postcode', 'phone']
			const unionFieldNames = ['trade_union_member', 'trade_union']

			fieldGroups = {
				personal: fields.filter((f) => personalFieldNames.includes(f.htmlName)),
				contact: fields.filter((f) => contactFieldNames.includes(f.htmlName)),
				union: fields.filter((f) => unionFieldNames.includes(f.htmlName)),
				other: fields.filter((f) => f.htmlName === 'workplace')
			}
		} catch (error) {
			errorMessage = 'Failed to load form fields'
			console.error('Error loading form fields:', error)
		}
	})

	function handleFocus() {
		isFocused = true
	}

	async function handleSubmit(event: Event) {
		event.preventDefault()
		const form = event.target as HTMLFormElement
		const formDataObj = new FormData(form)

		const processedFormData: Record<string, any> = {}

		// Process form data using HTML names first
		for (const field of fields) {
			const value = formDataObj.get(field.htmlName)
			if (value !== null && value !== '') {
				processedFormData[field.htmlName] = value
			}
		}

		isLoading = true
		isSubmitted = false
		errorMessage = ''
		submissionResult = null

		try {
			const response = await fetch('/api/action-network/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					formId,
					formData: processedFormData
				})
			})

			const result = await response.json()

			if (response.ok) {
				isLoading = false
				isSubmitted = true
				submissionResult = {
					region: result.data.region,
					whatsappLink: result.data.whatsappLink
				}
			} else {
				isLoading = false
				errorMessage = result.error || 'Something went wrong. Please try again.'
				console.error('Server error:', result)
			}
		} catch (error) {
			isLoading = false
			errorMessage = 'Something went wrong. Please try again.'
			console.error('Form submission error:', error)
		}
	}
</script>

<div class="mb-8">
	{#if isSubmitted}
		<div class="confirmation bg-caution rounded-xl p-8" transition:slide>
			<p class="text-lg font-sans">
				Thank you for signing up! We will contact you soon with more information.
			</p>
			{#if submissionResult?.region && submissionResult?.whatsappLink}
				<div class="mt-4">
					<Button
						label="Join your local WhatsApp group in {submissionResult.region}"
						url={submissionResult.whatsappLink}
						colourClass="bg-caution"
						textColourClass="text-extremedanger"
					/>
				</div>
			{:else}
				<div class="mt-4">
					<p class="mb-4">Find your local WhatsApp group by entering your postcode:</p>
					<Button
						label="Find your local group"
						url="/find-your-group"
						colourClass="bg-caution"
						textColourClass="text-extremedanger"
					/>
				</div>
			{/if}
		</div>
	{:else}
		{#if errorMessage}
			<div class="error" transition:slide>
				<p class="text-base italic text-extremedanger">
					{errorMessage}
				</p>
			</div>
		{/if}

		<form method="post" onsubmit={handleSubmit} class="contents" transition:slide>
			<div class="flex flex-col gap-3">
				<!-- Personal information (first group) -->
				{#if fieldGroups?.personal}
					<div class="grid grid-cols-3 gap-3">
						{#each fieldGroups.personal as field}
							<div>
								<input
									class="w-full border-white placeholder:text-black/75 border text-black rounded-md px-2 py-2 focus:bg-extremecaution transition-all duration-300 bg-caution"
									type={field.type}
									placeholder={field.placeholder}
									name={field.htmlName}
									required={field.required}
									disabled={isLoading}
									onfocus={handleFocus}
								/>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Contact information (second group) -->
				{#if fieldGroups?.contact}
					<div class="grid grid-cols-2 gap-3">
						{#each fieldGroups.contact as field}
							<div>
								<input
									class="w-full border-white placeholder:text-black/75 border text-black rounded-md px-2 py-2 focus:bg-extremecaution transition-all duration-300 bg-caution"
									type={field.type}
									placeholder={field.placeholder}
									name={field.htmlName}
									required={field.required}
									disabled={isLoading}
									onfocus={handleFocus}
								/>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Trade union section -->
				{#if fieldGroups?.union}
					<div class="flex flex-col gap-3">
						<!-- Trade union member checkbox -->
						{#each fieldGroups.union.filter((f) => f.type === 'checkbox') as field}
							<div class="relative overflow-hidden">
								<input
									type="checkbox"
									class="check absolute w-10 h-10 text-black border-black opacity-0"
									id={field.htmlName}
									name={field.htmlName}
									onchange={handleCheckboxChange}
									disabled={isLoading}
									onfocus={handleFocus}
								/>
								<label for={field.htmlName} class="label flex flex-row items-center gap-2">
									<div class="relative w-5 h-5">
										<div class="absolute inset-0 border-2 border-black rounded-sm" />
										<svg width="20" height="20" viewBox="0 0 400 400" class="absolute inset-0">
											<g>
												<path
													class="path1"
													fill="none"
													stroke-width="50"
													stroke="black"
													d="M 72.57142639160156 207.42857360839844 L 160.28571319580078 295.1428604125977 L 327.42857360839844 104.85714721679688"
												/>
											</g>
										</svg>
									</div>
									<span>{field.placeholder}</span>
								</label>
							</div>
						{/each}

						{#if isTradeUnionMember}
							<div class="grid grid-cols-2 gap-3" transition:slide>
								<!-- Trade union dropdown -->
								{#each fieldGroups.union.filter((f) => f.type === 'select') as field}
									<div class="relative">
										<select
											class="w-full border-white text-black border rounded-md px-2 py-2 focus:bg-extremecaution transition-all duration-300 bg-caution appearance-none"
											name={field.htmlName}
											required={field.required}
											disabled={isLoading}
											onfocus={handleFocus}
										>
											<option value="">{field.placeholder}</option>
											{#each field.options || [] as option}
												<option value={option}>{option}</option>
											{/each}
										</select>
										<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
											<svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
												<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
											</svg>
										</div>
									</div>
								{/each}

								<!-- Workplace field -->
								{#each fieldGroups.other as field}
									<div>
										<input
											class="w-full border-white placeholder:text-black/75 border text-black rounded-md px-2 py-2 focus:bg-extremecaution transition-all duration-300 bg-caution"
											type={field.type}
											placeholder={field.placeholder}
											name={field.htmlName}
											required={field.required}
											disabled={isLoading}
											onfocus={handleFocus}
										/>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<button
					type="submit"
					class="border-white border rounded-md px py-2 hover:bg-caution hover:text-extremedanger bg-caution text-extremecaution transition-all duration-300"
					disabled={isLoading}
				>
					{#if isLoading}
						<span>Submitting details...</span>
					{:else}
						<span>Sign Up</span>
					{/if}
				</button>

				{#if isFocused}
					<div class="acceptance" transition:slide>
						<p class="text-sm italic">
							<!-- Your existing acceptance text -->
						</p>
					</div>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style lang="postcss">
	.path1 {
		stroke-dasharray: 400;
		stroke-dashoffset: 400;
		transition: 0.5s stroke-dashoffset;
		opacity: 0;
	}
	.check:checked + label svg g path {
		opacity: 100;
		stroke-dashoffset: 0;
	}

	.check:checked + label .border-black {
		@apply bg-caution;
	}
</style>
