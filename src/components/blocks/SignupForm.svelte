<script lang="ts">
	import type { EditorBlock } from '$types/wp-types'
	import Signup from '$components/Signup.svelte'
	export let block: EditorBlock
	console.log('SignupForm block:', block)
</script>

<div class="px-2 md:px-0">
	<Signup 
		formId={block.signupForm?.formId || '1e49bee5-7886-4cc3-9ab5-b987ccce6139'}
		additionalFields={[
			...(block.signupForm?.emailField ? ['email'] : []),
			...(block.signupForm?.phoneField ? ['phone'] : []),
			...(block.signupForm?.postcodeField ? ['postcode'] : []),
			...(block.signupForm?.unionList ? ['trade_union'] : []),
			...(block.signupForm?.workplace ? ['workplace'] : [])
		]}
	/>
</div>
	