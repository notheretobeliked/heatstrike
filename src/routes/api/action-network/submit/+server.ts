import { AN_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Map of HTML field names to Action Network field names
const FIELD_NAME_MAP: Record<string, string> = {
	'firstname': 'First Name',
	'lastname': 'Last Name',
	'email': 'Email',
	'postcode': 'Postcode',
	'phone': 'Phone',
	'trade_union_member': 'Trade Union Member',
	'trade_union': 'Trade Union',
	'workplace': 'Workplace'
}

// Function to fetch region and WhatsApp data using our endpoint
async function getRegionData(postcode: string, baseUrl: string) {
	if (!postcode) {
		return null;
	}

	try {
		const response = await fetch(`${baseUrl}/api/whatsapp-finder?postcode=${encodeURIComponent(postcode)}`);
		if (!response.ok) {
			const errorText = await response.text();
			console.error('WhatsApp finder API error:', errorText);
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching region data:', error);
		return null;
	}
}

export const POST: RequestHandler = async ({ request, url }) => {
	const { formId, formData } = await request.json()

	if (!formId) {
		return json({ error: 'Form ID is required' }, { status: 400 })
	}

	try {
		// Get the base URL from the request
		const baseUrl = `${url.protocol}//${url.host}`;

		// Get region data if postcode is provided and not empty
		const regionData = formData.postcode && formData.postcode.trim() !== ''
			? await getRegionData(formData.postcode, baseUrl)
			: null;

		const hasPhone = formData.phone && formData.phone.trim() !== ''
		const hasPostcode = formData.postcode && formData.postcode.trim() !== ''

		// Transform form data into Action Network format.
		// Note: only include phone_numbers / postal_addresses when populated —
		// Action Network's API errors ("each_with_index for nil") on empty arrays.
		const activistObject = {
			person: {
				given_name: formData.firstname || '',
				family_name: formData.lastname || '',
				email_addresses: [
					{
						address: formData.email,
						status: 'subscribed'
					}
				],
				...(hasPhone && {
					phone_numbers: [
						{
							number: formData.phone,
							status: 'subscribed'
						}
					]
				}),
				...(hasPostcode && {
					postal_addresses: [
						{
							postal_code: formData.postcode,
							country: 'GB'
						}
					]
				}),
				custom_fields: {
					...(regionData?.region && { 'Region': regionData.region }),
					...(formData.trade_union && { 'Trade Union': formData.trade_union }),
					...(formData.workplace && { 'Workplace': formData.workplace })
				} as Record<string, string>
			},
			add_tags: ['Website signup'],
			triggers: {
				autoresponse: {
					enabled: true
				}
			}
		}

		// Add tags based on form data
		if (formData.trade_union_member === 'on') {
			activistObject.add_tags.push('Trade Union Member')
		}

		console.log('Sending to Action Network:', JSON.stringify(activistObject, null, 2));

		const response = await fetch(`https://actionnetwork.org/api/v2/forms/${formId}/submissions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OSDI-API-Token': AN_KEY
			},
			body: JSON.stringify(activistObject)
		})

		const responseText = await response.text()
		console.log('Action Network response:', responseText);

		if (!response.ok) {
			console.error('Action Network error:', responseText)
			return json(
				{
					error: 'Failed to submit form',
					details: responseText
				},
				{ status: response.status }
			)
		}

		return json({
			success: true,
			data: {
				given_name: formData.firstname,
				family_name: formData.lastname,
				email: formData.email,
				region: regionData?.region || null,
				whatsappLink: regionData?.whatsappLink || null
			}
		})
	} catch (error) {
		console.error('Error submitting form:', error)
		return json({ error: 'Failed to submit form' }, { status: 500 })
	}
}