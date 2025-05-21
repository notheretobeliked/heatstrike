import { AN_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Cache form metadata for 1 hour and allow revalidation with a bypass token
export const config = {
	isr: {
		expiration: 3600, // 1 hour in seconds
		bypassToken: 'formMetadataRevalidateOrElseYouWillPayForthisIn2026'
	},
	prerender: {
		entries: [
			'/api/action-network/form?formId=1e49bee5-7886-4cc3-9ab5-b987ccce6139'
		]
	}
};

type ActionNetworkField = {
	name: string        // Original name with spaces (for Action Network)
	htmlName?: string   // Sanitized name for HTML attributes
	type: 'text' | 'email' | 'select' | 'checkbox'
	required: boolean
	options?: string[] // For dropdown fields
	placeholder?: string
}

// Helper function to create HTML-safe names
function createHtmlSafeName(fieldName: string): string {
	return fieldName
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '_') // Replace spaces with underscores
		.replace(/[^a-z0-9_]/g, '') // Remove any non-alphanumeric characters except underscores
}

// Default fields that are always included
const DEFAULT_FIELDS: ActionNetworkField[] = [
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
	},
	{
		name: 'email',
		htmlName: 'email',
		type: 'email',
		required: true,
		placeholder: 'Your email'
	},
	{
		name: 'postal_code',
		htmlName: 'postcode',
		type: 'text',
		required: false,
		placeholder: 'Your postcode (optional)'
	}
]

// Trade union fields that are included by default
const TRADE_UNION_FIELDS: ActionNetworkField[] = [
	{
		name: 'Trade Union Member',
		htmlName: 'trade_union_member',
		type: 'checkbox',
		required: false,
		placeholder: 'Are you a member of a trade union?'
	},
	{
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
			'Artists\' Union England',
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
	{
		name: 'Workplace',
		htmlName: 'workplace',
		type: 'text',
		required: false,
		placeholder: 'Where do you work? (optional)'
	}
]

export const GET: RequestHandler = async ({ url, request }) => {
	// Try both URL and Request objects to handle both SSR and ISR cases
	const formId = url.searchParams.get('formId') || new URL(request.url).searchParams.get('formId')
	const additionalFieldsParam = url.searchParams.get('additionalFields') || new URL(request.url).searchParams.get('additionalFields')
	const additionalFields = additionalFieldsParam?.split(',') || []

	console.log('Request URL:', request.url)
	console.log('Parsed formId:', formId)

	if (!formId) {
		return json({ error: 'Form ID is required' }, { status: 400 })
	}

	try {
		console.log('Fetching form details for formId:', formId)

		// First, fetch the form details from Action Network
		const formResponse = await fetch(`https://actionnetwork.org/api/v2/forms/${formId}`, {
			headers: {
				'OSDI-API-Token': AN_KEY,
				'Content-Type': 'application/json'
			}
		})

		const formResponseText = await formResponse.text()
		console.log('Form API Response Status:', formResponse.status)
		console.log('Form API Response Headers:', Object.fromEntries(formResponse.headers.entries()))
		
		if (!formResponse.ok) {
			console.error('Action Network form error:', formResponseText)
			return json({ 
				error: 'Failed to fetch form details',
				status: formResponse.status,
				details: formResponseText
			}, { status: formResponse.status })
		}

		const formData = JSON.parse(formResponseText)

		console.log('Fetching custom fields metadata')

		// Then, fetch the custom fields metadata
		const customFieldsResponse = await fetch('https://actionnetwork.org/api/v2/metadata/custom_fields', {
			headers: {
				'OSDI-API-Token': AN_KEY,
				'Content-Type': 'application/json'
			}
		})

		const customFieldsResponseText = await customFieldsResponse.text()
		console.log('Custom Fields API Response Status:', customFieldsResponse.status)
		
		if (!customFieldsResponse.ok) {
			console.error('Action Network custom fields error:', customFieldsResponseText)
			return json({ 
				error: 'Failed to fetch custom fields',
				status: customFieldsResponse.status,
				details: customFieldsResponseText
			}, { status: customFieldsResponse.status })
		}

		const customFieldsData = JSON.parse(customFieldsResponseText)

		// Start with default fields
		const fields = [...DEFAULT_FIELDS]

		// Add trade union fields by default
		fields.push(...TRADE_UNION_FIELDS)

		// Add any requested additional custom fields
		if (additionalFields.length > 0 && customFieldsData['action_network:custom_fields']) {
			console.log('Processing additional fields:', additionalFields)
			
			const customFields = customFieldsData['action_network:custom_fields']
				.filter((field: any) => additionalFields.includes(field.name))
				.map((field: any) => ({
					name: field.name,  // Keep original name for Action Network
					htmlName: createHtmlSafeName(field.name),  // Create HTML-safe name
					type: 'text', // Default to text type for custom fields
					required: false,
					placeholder: field.name
				}))

			fields.push(...customFields)
		}

		console.log('Successfully processed form fields')
		return json({ fields })
	} catch (error) {
		console.error('Error fetching form details:', error)
		// Include more error details in the response
		return json({ 
			error: 'Failed to fetch form details',
			details: error instanceof Error ? error.message : String(error)
		}, { status: 500 })
	}
}
