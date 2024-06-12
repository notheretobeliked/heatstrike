<script lang="ts">
	import { slide } from 'svelte/transition'

	export let action: string = '/'
	let isFocused = false
	let isLoading = false
	let isSubmitted = false
	let errorMessage = ''

	function handleFocus() {
		isFocused = true
	}

	async function handleSubmit(event: Event) {
		event.preventDefault()
		const form = event.target as HTMLFormElement
		const formData = new FormData(form)

		isLoading = true
		isSubmitted = false
		errorMessage = ''

		try {
			const response = await fetch(action, {
				method: 'POST',
				body: formData
			})

			if (response.ok) {
				isLoading = false
				isSubmitted = true
			} else {
				const errorData = await response.json()
				isLoading = false
				errorMessage = errorData.message || 'Something went wrong. Please try again.'
			}
		} catch (error) {
			isLoading = false
			errorMessage = 'Something went wrong. Please try again.'
		}
	}
</script>

{#if isSubmitted}
	<div class="confirmation" transition:slide>
		<p class="text-xl italic py-7">
			Thank you for signing up! We will contact you soon with more information on how you can join Heat Strike.
		</p>
	</div>
{:else}
{#if errorMessage}
<div class="error" transition:slide>
	<p class="text-base italic text-extremedanger">
		{errorMessage}
	</p>
</div>
{/if}
	<form method="post" {action} on:submit={handleSubmit} class="contents" transition:slide>
		<div class="flex flex-col gap-3">
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="firstname" class="sr-only">First name:</label>
					<input
						class="border-white border focus:text-black rounded-md px-2 py-2 focus:bg-caution transition-all duration-300 w-full"
						type="text"
						placeholder="First name"
						name="firstname"
						required
						disabled={isLoading}
						on:focus={handleFocus}
					/>
				</div>
				<div>
					<label for="lastname" class="sr-only">Last name:</label>
					<input
						class="border-white border focus:text-black rounded-md px-2 py-2 focus:bg-caution transition-all duration-300 w-full"
						type="text"
						placeholder="Last name"
						name="lastname"
						required
						disabled={isLoading}
						on:focus={handleFocus}
					/>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<label for="email" class="sr-only">Email:</label>
				<input
					class="w-full border-white border rounded-md px-2 py-2 focus:bg-caution transition-all duration-300"
					type="email"
					placeholder="Your email"
					name="email"
					required
					disabled={isLoading}
					on:focus={handleFocus}
				/>

				<label for="postcode" class="sr-only">Postcode (optional):</label>
				<input
					class="w-full border-white border rounded-md px-2 py-2 focus:bg-caution transition-all duration-300"
					type="text"
					placeholder="Your postcode (optional)"
					name="postcode"
					disabled={isLoading}
					on:focus={handleFocus}
				/>
			</div>
			<div class="relative overflow-hidden">
				<input
					type="checkbox"
					class="check absolute w-10 h-10 opacity-0"
					id="organiser"
					name="organiser"
					disabled={isLoading}
				/>
				<label for="organiser" class="label flex flex-row items-center">
					<svg class="w-12 h-12 align-top -translate-x-3" viewBox="0 0 95 95">
						<rect x="30" y="20" width="50" height="50" stroke="black" fill="none" />
						<g transform="translate(0,-952.36222)">
							<path
								d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4 "
								stroke="black"
								stroke-width="3"
								fill="none"
								class="path1 transition-opacity duration-500 opacity-0"
							/>
						</g>
					</svg>
					<span
						>I am signing up on behalf of an organisation and would like more information to help us
						organise.</span
					>
				</label>
			</div>

			<button
				type="submit"
				class="border-white border rounded-md px py-2 hover:bg-caution hover:text-extremedanger bg-black text-extremecaution transition-all duration-300"
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
						By signing up, you agree to receive email updates from Heat Strike and Tipping Point UK.
						Heat Strike is hosted by Tipping Point UK who provide powerful tools to support
						grassroots groups organising for climate justice. Tipping Point handles your data
						securely in line with our <a
							class="underline underline-offset-2"
							target="_blank"
							href="https://tippingpointuk.org/privacy/">privacy policy</a
						>. We only communicate directly with you in crucial moments for the wider movement and
						you can unsubscribe at any time.
					</p>
				</div>
			{/if}
		</div>
	</form>
{/if}

<style lang="postcss">
	.path1 {
		stroke-dasharray: 400;
		stroke-dashoffset: 400;
		transition: 0.5s stroke-dashoffset;
		opacity: 0;
	}
	.check:checked + label svg g path {
		@apply stroke-danger opacity-100;
		stroke-dashoffset: 0;
	}
</style>
