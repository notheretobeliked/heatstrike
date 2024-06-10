<script lang="ts">
	import { enhance } from '$app/forms'
	export let action: string = '/'
</script>

<form method="post" {action} use:enhance class="contents">
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
				/>
			</div>
			<div>
				<label for="lastname" class="sr-only">Last name:</label>
				<input
					class="border-white border focus:text-black rounded-md px-2 py-2 focus:bg-caution transition-all duration-300  w-full"
					type="text"
					placeholder="Last name"
					name="lastname"
					required
				/>
			</div>
		</div>
		<div>
			<label for="email" class="sr-only">Email:</label>
			<input
				class="w-full border-white border rounded-md px-2 py-2 focus:bg-caution transition-all duration-300"
				type="email"
				placeholder="Your email"
				name="email"
				required
			/>
		</div>

		<button
			type="submit"
			class="border-white border rounded-md px py-2 hover:bg-caution transition-all duration-300"
			>Sign Up</button
		>
	</div>
</form>
