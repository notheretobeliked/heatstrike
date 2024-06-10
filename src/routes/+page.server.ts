import { AN_KEY } from '$env/static/private'
import { error } from '@sveltejs/kit'
import PageContent from '$lib/graphql/query/page.graphql?raw'
import { checkResponse, graphqlQuery } from '$lib/utilities/graphql'
import type { PageServerLoad, Actions } from './$types'
import type { PersonResponse } from '$lib/types/types'
import { flatListToHierarchical } from '$lib/utilities/utilities'

export const config = {
	isr: {
		expiration: 3600
	}
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData()
		const email = data.get('email')
		const firstname = data.get('firstname')
		const lastname = data.get('lastname')

		const activistObject = {
			person: {
				family_name: lastname,
				given_name: firstname,
				email_addresses: [{ address: email }]
			},
			add_tags: ['Website signup', 'Test user']
		}

		try {
			const response = await fetch('https://actionnetwork.org/api/v2/people', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'OSDI-API-Token': AN_KEY
				},
				body: JSON.stringify(activistObject)
			})

			if (!response.ok) {
				const errorData = await response.json()
				return {
					status: response.status,
					error: errorData,
					success: false
				}
			}

			const responseData = await response.json()
			const data: PersonResponse = {
				given_name: responseData.given_name,
				family_name: responseData.family_name,
				email: responseData.email_addresses[0].address
			}
			return {
				status: 200,
				success: true,
				data
			}
		} catch (err) {
			return {
				status: 500,
				error: err.message,
				success: false
			}
		}
	}
} satisfies Actions

export const load: PageServerLoad = async function load({ params, url }) {
	try {
		const uri = `/`
		const weatherRes = await fetch(
			'https://api.open-meteo.com/v1/forecast?latitude=51.503553657200996&longitude=-0.12779310629778032&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m'
		)
		const weatherData = await weatherRes.json()
        console.log(weatherData)

		const response = await graphqlQuery(PageContent, { uri: uri })
		checkResponse(response)

		const { data }: { data: any } = await response.json()
        console.log(data)
		if (data.page === null) {
			error(404, {
				message: 'Not found'
			})
		}

		let editorBlocks = data.page.editorBlocks ? flatListToHierarchical(data.page.editorBlocks) : []

		return {
			temp: weatherData.current_weather.temperature,
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
