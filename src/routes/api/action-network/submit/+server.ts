import { AN_KEY, OS_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Map of HTML field names to Action Network field names
const FIELD_NAME_MAP: Record<string, string> = {
	'firstname': 'First Name',
	'lastname': 'Last Name',
	'email': 'Email',
	'postcode': 'Postcode',
	'trade_union_member': 'Trade Union Member',
	'trade_union': 'Trade Union',
	'workplace': 'Workplace'
}

// Function to determine region based on OS Names API data
function determineRegion(gazetteerEntry: any): string {
	const region = gazetteerEntry.REGION;
	const countyUnitary = gazetteerEntry.COUNTY_UNITARY;
	const country = gazetteerEntry.COUNTRY;

	// Check for London first
	if (region === 'London' || countyUnitary === 'Greater London') {
		return 'London';
	}

	// Check for Scotland and Northern Ireland
	if (country === 'Northern Ireland' || country === 'Scotland') {
		return 'Scotland & Northern Ireland';
	}

	// Check for Wales
	if (country === 'Wales') {
		return 'Cymru';
	}

	// Map regions to our defined regions
	const regionMapping: Record<string, string> = {
		'London': 'London',
		'South West': 'South West',
		'South East': 'South East',
		'East of England': 'East of England',
		'West Midlands': 'Midlands',
		'East Midlands': 'Midlands',
		'Yorkshire and the Humber': 'North of England',
		'North West': 'North of England',
		'North East': 'North of England'
	};

	if (region && regionMapping[region]) {
		return regionMapping[region];
	}

	return 'Unknown';
}

// Function to fetch geocoding data from OS Names API
async function getGeocodingData(postcode: string) {
	if (!postcode) {
		return null;
	}

	const url = `https://api.os.uk/search/names/v1/find?query=${encodeURIComponent(postcode)}&maxresults=1&fq=LOCAL_TYPE:Postcode&key=${OS_KEY}`;
	
	try {
		const response = await fetch(url);
		if (!response.ok) {
			const errorText = await response.text();
			console.error('OS Names API error status:', response.status);
			console.error('OS Names API error:', errorText);
			return null;
		}

		const data = await response.json();
		if (!data.results || data.results.length === 0) {
			return null;
		}

		const result = data.results[0].GAZETTEER_ENTRY;

		return {
			lat: result.GEOMETRY_Y / 100000, // Convert to decimal degrees
			lng: result.GEOMETRY_X / 100000, // Convert to decimal degrees
			region: determineRegion(result),
			components: {
				locality: result.POPULATED_PLACE,
				county: result.COUNTY_UNITARY,
				state: result.REGION
			}
		};
	} catch (error) {
		console.error('Error fetching geocoding data:', error);
		return null;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const { formId, formData } = await request.json()

	if (!formId) {
		return json({ error: 'Form ID is required' }, { status: 400 })
	}

	try {
		// Get geocoding data if postcode is provided
		const geocodingData = formData.postal_code ? await getGeocodingData(formData.postal_code) : null;

		// Transform form data into Action Network format
		const activistObject = {
			person: {
				given_name: formData.given_name,
				family_name: formData.family_name,
				email_addresses: [
					{
						address: formData.email,
						status: 'subscribed'
					}
				],
				postal_addresses: formData.postal_code
					? [
							{
								postal_code: formData.postal_code,
								country: 'GB',
								...(geocodingData?.components?.locality && { locality: geocodingData.components.locality }),
								...(geocodingData?.components?.county && { county: geocodingData.components.county }),
								...(geocodingData?.components?.state && { state: geocodingData.components.state })
							}
					  ]
					: [],
				custom_fields: {
					...(geocodingData?.region && { 'Region': geocodingData.region }),
					...(geocodingData?.lat && { 'Latitude': geocodingData.lat.toString() }),
					...(geocodingData?.lng && { 'Longitude': geocodingData.lng.toString() })
				} as Record<string, string>
			},
			add_tags: ['Website signup'],
			triggers: {
				autoresponse: {
					enabled: true
				}
			}
		}

		// Add any custom fields to the submission
		for (const [key, value] of Object.entries(formData)) {
			// Skip the main fields and trade union member (which is handled as a tag)
			if (!['given_name', 'family_name', 'email', 'postal_code', 'organiser', 'Trade Union Member'].includes(key)) {
				activistObject.person.custom_fields[key] = value as string
			}
		}

		// Add tags based on form data
		if (formData.organiser === 'on') {
			activistObject.add_tags.push('organiser')
		}
		if (formData['Trade Union Member'] === 'on') {
			activistObject.add_tags.push('Trade Union Member')
		}

		const response = await fetch(`https://actionnetwork.org/api/v2/forms/${formId}/submissions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OSDI-API-Token': AN_KEY
			},
			body: JSON.stringify(activistObject)
		})

		const responseText = await response.text()

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
				given_name: formData.given_name,
				family_name: formData.family_name,
				email: formData.email
			}
		})
	} catch (error) {
		console.error('Error submitting form:', error)
		return json({ error: 'Failed to submit form' }, { status: 500 })
	}
}
