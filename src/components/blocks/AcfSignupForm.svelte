<script lang="ts">
	import type { EditorBlock } from '$lib/types/wp-types'
	import Signup from '$components/Signup.svelte'

	interface Props {
		block: EditorBlock
	}

	let { block }: Props = $props()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const signupForm = (block as any).signupForm ?? {}
	const additionalFields = [
		...(signupForm.emailField ? ['email'] : []),
		...(signupForm.phoneField ? ['phone'] : []),
		...(signupForm.postcodeField ? ['postcode'] : []),
		...(signupForm.unionList ? ['trade_union'] : []),
		...(signupForm.workplace ? ['workplace'] : [])
	]
</script>

<div class="px-2 md:px-0">
	<Signup formId={signupForm.formId} {additionalFields} />
</div>
