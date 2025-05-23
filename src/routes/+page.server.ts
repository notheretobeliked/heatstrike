import { AN_KEY, OPENCAGE_KEY } from '$env/static/private' // Include your OpenCage API key
import { error } from '@sveltejs/kit'
import PageContent from '$lib/graphql/query/page.graphql?raw'
import { checkResponse, graphqlQuery } from '$lib/utilities/graphql'
import type { PageServerLoad, Actions } from './$types'
import type { PersonResponse } from '$lib/types/types'
import { flatListToHierarchical } from '$lib/utilities/utilities'

export const config = {
	isr: {
		expiration: 3600,
		bypassToken: 'rogerhallamNU39DYTPZ8350FK1JL3OX8EOX31EM6EC'
	}
}

// Function to fetch city and country from postal code using OpenCage API
async function getCityAndCountry(postcode) {
	if (!postcode) {
		return { city: null, country: null, state: null, county: null }
	}
	// Append ", UK" to ensure the search is within the UK
	const query = `${postcode}, UK`
	const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${
		process.env.OPENCAGE_KEY
	}`
	const response = await fetch(url)

	if (response.ok) {
		const data = await response.json()

		if (data.results.length > 0) {
			const components = data.results[0].components
			const city = components.city || components.town || components.village || components.locality
			const country = components.country
			const county = components.county
			const state = components.state
			return { city, country, state, county }
		}
	}

	return { city: null, country: null, state: null, county: null }
}

export const actions = {
	default: async ({ request, params }) => {
		const data = await request.formData()
		const email = data.get('email')
		const firstname = data.get('firstname')
		const lastname = data.get('lastname')
		const postcode = data.get('postcode')?.toString()

		const organiser = data.get('organiser') === 'on' // Check if the checkbox is checked

		// Fetch city and country from postal code if provided
		const { city, country, county, state } = await getCityAndCountry(postcode)

		const postalAddresses = []
		if (postcode || city || country) {
			postalAddresses.push({
				postal_code: postcode,
				locality: city,
				county: county,
				state: state,
				country: 'GB'
			})
		}

		const addTags = ['Website signup']
		if (organiser) {
			addTags.push('organiser')
		}

		const activistObject = {
			person: {
				family_name: lastname,
				given_name: firstname,
				email_addresses: [{ address: email, status: 'subscribed' }],
				postal_addresses: postalAddresses
			},
			add_tags: addTags,
			triggers: {
				autoresponse: {
					enabled: true
				}
			}
		}


		try {
			const response = await fetch(
				'https://actionnetwork.org/api/v2/forms/1e49bee5-7886-4cc3-9ab5-b987ccce6139/submissions',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'OSDI-API-Token': AN_KEY
					},
					body: JSON.stringify(activistObject)
				}
			)

			const responseText = await response.text()

			if (!response.ok) {
				let errorData = null
				try {
					errorData = JSON.parse(responseText)
				} catch (e) {
					errorData = { message: 'Failed to parse error response' }
				}
				
				console.error('Action Network error:', errorData)
				return {
					status: response.status,
					error: errorData,
					success: false
				}
			}

			let responseData = null
			try {
				responseData = JSON.parse(responseText)
				
				// Success! Create the response object
				const data: PersonResponse = {
					given_name: firstname as string, // Use submitted data since the API might not return it
					family_name: lastname as string,
					email: email as string
				}
				
				return {
					status: 200,
					success: true,
					data
				}
			} catch (parseError) {
				console.error('Error parsing Action Network response:', parseError)
				return {
					status: 200, // The request was successful even if we couldn't parse the response
					success: true,
					data: {
						given_name: firstname as string,
						family_name: lastname as string,
						email: email as string
					}
				}
			}
		} catch (err) {
			console.error('Error submitting to Action Network:', err)
			return {
				status: 500,
				error: { message: err.message || 'An unexpected error occurred' },
				success: false
			}
		}
	}
} satisfies Actions

export const load: PageServerLoad = async function load({ params, url }) {
	try {
		const uri = `/`

		const response = await graphqlQuery(PageContent, { uri: uri })
		checkResponse(response)

		const { data }: { data: any } = await response.json()

		if (data.page === null) {
			error(404, {
				message: 'Not found'
			})
		}

		let editorBlocks = data.page.editorBlocks ? flatListToHierarchical(data.page.editorBlocks) : []

		return {

			data: data,
			uri: uri,
			editorBlocks: editorBlocks
		}
	} catch (err: unknown) {
		const httpError = err as { status: number; message: string }
		if (httpError.message) {
			error(httpError.status ?? 500, httpError.message)
		}
		error(500, err as string)
	}
}
