<script lang="ts">
	interface SignupFormBlock {
		name: string;
		parentClientId: string;
		clientId: string;
		__typename: "AcfSignupForm";
		signupForm: {
			formId: string;
			emailField: boolean;
			phoneField: boolean;
			postcodeField: boolean;
			unionList: boolean;
			workplace: boolean;
		};
		attributes: {
			alignment: string;
			backgroundColor: string | null;
			textColor: string | null;
		};
		children: Array<{
			name: string;
			parentClientId: string;
			clientId: string;
			__typename: string;
			attributes: Record<string, unknown>;
			children: Array<unknown>;
		}>;
	}

	import Signup from '$components/Signup.svelte'
	let { block } = $props<{ block: SignupFormBlock }>();
	
	const additionalFields = [
		...(block.signupForm.emailField ? ['email'] : []),
		...(block.signupForm.phoneField ? ['phone'] : []),
		...(block.signupForm.postcodeField ? ['postcode'] : []),
		...(block.signupForm.unionList ? ['trade_union'] : []),
		...(block.signupForm.workplace ? ['workplace'] : [])
	];
	
</script>

<div class="px-2 md:px-0">
	<Signup 
		formId={block.signupForm.formId}
		{additionalFields}
	/>
</div>
	