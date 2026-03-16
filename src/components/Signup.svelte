<script lang="ts">
	import { slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import ProjectButton from '$components/atoms/ProjectButton.svelte'

	let {
		formId = '1e49bee5-7886-4cc3-9ab5-b987ccce6139',
		additionalFields = []
	}: {
		formId?: string
		additionalFields?: string[]
	} = $props()

	type FormField = {
		name: string
		htmlName: string
		type: string
		required: boolean
		placeholder?: string
		options?: string[]
	}

	const FIELD_DEFINITIONS: Record<string, FormField> = {
		email: {
			name: 'email',
			htmlName: 'email',
			type: 'email',
			required: true,
			placeholder: 'Your email*'
		},
		phone: {
			name: 'phone_number',
			htmlName: 'phone',
			type: 'tel',
			required: false,
			placeholder: 'Phone number'
		},
		postcode: {
			name: 'postal_code',
			htmlName: 'postcode',
			type: 'text',
			required: true,
			placeholder: 'Your postcode*'
		},
		trade_union: {
			name: 'Trade Union',
			htmlName: 'trade_union',
			type: 'select',
			required: false,
			placeholder: 'Which trade union are you a part of?',
			options: [
				'No union',
				'Accord',
				'Advance',
				'Aegis',
				'AEP',
				'AFA-CWA',
				"Artists' Union England",
				'ASLEF',
				'BALPA',
				'BDA',
				'BECTU Sector of Prospect',
				'BFAWU',
				'BOSTU',
				'Community',
				'CSP',
				'CWU',
				'EIS',
				'Equity',
				'FBU',
				'FDA',
				'GMB',
				'HCSA',
				'MU',
				'NAHT',
				'Napo',
				'NARS',
				'NASUWT',
				'National House Building Council Staff Association',
				'National Society for Education in Art and Design (NSEAD)',
				'Nautilus International',
				'NEU',
				'NGSU',
				'NUJ',
				'NUM',
				'PCS',
				'PFA',
				'POA',
				'Prospect',
				'RCM',
				'RMT',
				'Royal College of Podiatry',
				'SoR',
				'TSSA',
				'UCAC',
				'UCU',
				'UNISON',
				'Unite',
				'URTU',
				'UVW',
				'USDAW',
				'WGGB',
				'IWGB',
				'Other Union'
			]
		},
		workplace: {
			name: 'Workplace',
			htmlName: 'workplace',
			type: 'text',
			required: false,
			placeholder: 'Where do you work? (optional)'
		}
	}

	const DEFAULT_FIELDS: FormField[] = [
		{
			name: 'given_name',
			htmlName: 'firstname',
			type: 'text',
			required: true,
			placeholder: 'First name'
		},
		{
			name: 'family_name',
			htmlName: 'lastname',
			type: 'text',
			required: true,
			placeholder: 'Last name'
		}
	]

	const TRADE_UNION_MEMBER_FIELD: FormField = {
		name: 'Trade Union Member',
		htmlName: 'trade_union_member',
		type: 'checkbox',
		required: false,
		placeholder: 'Are you a member of a trade union?'
	}

	let fields = $state<FormField[]>([])
	let isFocused = $state(false)
	let isLoading = $state(false)
	let isSubmitted = $state(false)
	let errorMessage = $state('')
	let isTradeUnionMember = $state(false)
	let submissionResult = $state<{ region?: string; whatsappLink?: string } | null>(null)

	let fieldGroups = $state({
		personal: [] as FormField[],
		contact: [] as FormField[],
		union: [] as FormField[],
		other: [] as FormField[]
	})

	function handleCheckboxChange(event: Event) {
		const checkbox = event.target as HTMLInputElement
		if (checkbox.name === 'trade_union_member') {
			isTradeUnionMember = checkbox.checked
		}
	}

	function buildFields() {
		const allFields = [...DEFAULT_FIELDS]

		for (const fieldKey of additionalFields) {
			if (fieldKey === 'trade_union') {
				allFields.push(TRADE_UNION_MEMBER_FIELD)
				allFields.push(FIELD_DEFINITIONS.trade_union)
			} else if (FIELD_DEFINITIONS[fieldKey]) {
				allFields.push(FIELD_DEFINITIONS[fieldKey])
			}
		}

		fields = allFields

		const personalFieldNames = ['firstname', 'lastname', 'email']
		const contactFieldNames = ['postcode', 'phone']
		const unionFieldNames = ['trade_union_member', 'trade_union']

		fieldGroups = {
			personal: fields.filter((f) => personalFieldNames.includes(f.htmlName)),
			contact: fields.filter((f) => contactFieldNames.includes(f.htmlName)),
			union: fields.filter((f) => unionFieldNames.includes(f.htmlName)),
			other: fields.filter((f) => f.htmlName === 'workplace')
		}
	}

	onMount(() => {
		buildFields()
	})

	function handleFocus() {
		isFocused = true
	}

	async function handleSubmit(event: Event) {
		event.preventDefault()
		const form = event.target as HTMLFormElement
		const formDataObj = new FormData(form)

		const processedFormData: Record<string, unknown> = {}

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
					<ProjectButton
						label="Join your local WhatsApp group in {submissionResult.region}"
						url={submissionResult.whatsappLink}
						colourClass="bg-caution"
						textColourClass="text-extremedanger"
					/>
				</div>
			{:else}
				<div class="mt-4">
					<p class="mb-4">Find your local WhatsApp group by entering your postcode:</p>
					<ProjectButton
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

				{#if fieldGroups?.union}
					<div class="flex flex-col gap-3">
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
										<div
											class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
										>
											<svg
												class="fill-current h-4 w-4"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
											>
												<path
													d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
												/>
											</svg>
										</div>
									</div>
								{/each}

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
						<p class="text-sm italic"></p>
					</div>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style>
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
		background-color: var(--color-caution);
	}
</style>
