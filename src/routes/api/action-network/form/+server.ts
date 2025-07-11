import { AN_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

type ActionNetworkField = {
	name: string        // Original name with spaces (for Action Network)
	htmlName?: string   // Sanitized name for HTML attributes
	type: 'text' | 'email' | 'select' | 'checkbox'
	required: boolean
	options?: string[] // For dropdown fields
	placeholder?: string
}

// In-memory cache to prevent hitting rate limits
const formCache = new Map<string, { data: any, timestamp: number }>()
const customFieldsCache = { data: null as any, timestamp: 0 }
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Helper function to check if cache is valid
function isCacheValid(timestamp: number): boolean {
	return Date.now() - timestamp < CACHE_DURATION
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
		placeholder: 'Your email*'
	},
	{
		name: 'postal_code',
		htmlName: 'postcode',
		type: 'text',
		required: true,
		placeholder: 'Your postcode*'
	},
	{
		name: 'phone_number',
		htmlName: 'phone',
		type: 'text',
		required: false,
		placeholder: 'Phone number'
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

	if (!formId) {
		return json({ error: 'Form ID is required' }, { status: 400 })
	}

	try {
		let formData: any
		let customFieldsData: any

		// Check cache for form data first
		const cachedForm = formCache.get(formId)
		if (cachedForm && isCacheValid(cachedForm.timestamp)) {
			console.log('Using cached form data for:', formId)
			formData = cachedForm.data
		} else {
			// Fetch fresh form data
			console.log('Fetching fresh form data for:', formId)
			const formResponse = await fetch(`https://actionnetwork.org/api/v2/forms/${formId}`, {
				headers: {
					'OSDI-API-Token': AN_KEY,
					'Content-Type': 'application/json'
				}
			})

			const formResponseText = await formResponse.text()
			if (!formResponse.ok) {
				console.error('Action Network form error:')
				console.error('Status:', formResponse.status)
				console.error('Status Text:', formResponse.statusText)
				console.error('Response:', formResponseText)
				console.error('Form ID:', formId)
				console.error('Request URL:', `https://actionnetwork.org/api/v2/forms/${formId}`)
				
				return json({ 
					error: 'Failed to fetch form details',
					status: formResponse.status,
					statusText: formResponse.statusText,
					details: formResponseText,
					formId: formId
				}, { status: formResponse.status })
			}

			formData = JSON.parse(formResponseText)
			// Cache the form data
			formCache.set(formId, { data: formData, timestamp: Date.now() })
		}

		// Check cache for custom fields
		if (customFieldsCache.data && isCacheValid(customFieldsCache.timestamp)) {
			console.log('Using cached custom fields data')
			customFieldsData = customFieldsCache.data
		} else {
			// Fetch fresh custom fields data
			console.log('Fetching fresh custom fields data')
			const customFieldsResponse = await fetch('https://actionnetwork.org/api/v2/metadata/custom_fields', {
				headers: {
					'OSDI-API-Token': AN_KEY,
					'Content-Type': 'application/json'
				}
			})

			const customFieldsResponseText = await customFieldsResponse.text()
			
			if (!customFieldsResponse.ok) {
				console.error('Action Network custom fields error:', customFieldsResponseText)
				return json({ 
					error: 'Failed to fetch custom fields',
					status: customFieldsResponse.status,
					details: customFieldsResponseText
				}, { status: customFieldsResponse.status })
			}

			customFieldsData = JSON.parse(customFieldsResponseText)
			// Cache the custom fields data
			customFieldsCache.data = customFieldsData
			customFieldsCache.timestamp = Date.now()
		}

		// Start with default fields
		const fields = [...DEFAULT_FIELDS]

		// Add trade union fields by default
		fields.push(...TRADE_UNION_FIELDS)

		// Add any requested additional custom fields
		if (additionalFields.length > 0 && customFieldsData['action_network:custom_fields']) {
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

		return json({ fields }, {
			headers: {
				'Cache-Control': 'max-age=300', // 5 minutes browser cache
				'CDN-Cache-Control': 'max-age=3600', // 1 hour CDN cache
				'Vercel-CDN-Cache-Control': 'max-age=3600' // 1 hour Vercel cache
			}
		})
	} catch (error) {
		console.error('Error fetching form details:', error)
		return json({ 
			error: 'Failed to fetch form details',
			details: error instanceof Error ? error.message : String(error)
		}, { status: 500 })
	}
}
