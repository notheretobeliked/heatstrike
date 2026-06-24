import { AN_KEY, WORDPRESS_URL, AN_COUNT_SECRET } from '$env/static/private'
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

// Whether this email is a brand-new subscriber (so the live count should tick up).
// Returns false only when AN confirms the person already has a subscribed email —
// i.e. a returning subscriber resubmitting. On any uncertainty (no match, or the
// lookup fails) we return true and count it; the hourly recount reconciles either way.
async function isNewSubscriber(email: string): Promise<boolean> {
	if (!email) return false
	try {
		const filter = encodeURIComponent(`email_address eq '${email.toLowerCase()}'`)
		const res = await fetch(`https://actionnetwork.org/api/v2/people/?filter=${filter}`, {
			headers: { 'OSDI-API-Token': AN_KEY, 'Content-Type': 'application/json' }
		})
		if (!res.ok) return true
		const data = await res.json()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const people: any[] = data?._embedded?.['osdi:people'] ?? []
		const alreadySubscribed = people.some((p) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(p?.email_addresses ?? []).some((e: any) => e?.status === 'subscribed')
		)
		return !alreadySubscribed
	} catch (error) {
		console.error('Error checking existing subscriber:', error)
		return true
	}
}

// Bump the live count on the WordPress backend (best-effort — a failure just means
// the new signup shows up at the next reconciliation crawl instead of immediately).
async function incrementBackendCount() {
	try {
		await fetch(`${WORDPRESS_URL}/wp-json/actionnetwork/v1/count/increment`, {
			method: 'POST',
			headers: { 'X-Count-Secret': AN_COUNT_SECRET }
		})
	} catch (error) {
		console.error('Failed to increment subscriber count:', error)
	}
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

		// Fetch region data and check whether this is a new subscriber in parallel,
		// so the existence check adds no extra latency to the signup.
		const [regionData, isNew] = await Promise.all([
			formData.postcode && formData.postcode.trim() !== ''
				? getRegionData(formData.postcode, baseUrl)
				: Promise.resolve(null),
			isNewSubscriber(formData.email)
		]);

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

		// Only bump the live count for genuinely new subscribers (returning subscribers
		// resubmitting won't change the AN total, so they shouldn't change ours either).
		if (isNew) {
			await incrementBackendCount()
		}

		return json({
			success: true,
			data: {
				given_name: formData.firstname,
				family_name: formData.lastname,
				email: formData.email,
				region: regionData?.region || null,
				whatsappLink: regionData?.whatsappLink || null,
				isNew
			}
		})
	} catch (error) {
		console.error('Error submitting form:', error)
		return json({ error: 'Failed to submit form' }, { status: 500 })
	}
}