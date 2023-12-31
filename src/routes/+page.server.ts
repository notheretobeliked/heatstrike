import { PUBLIC_URL } from '$env/static/public'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const config = {
	isr: {
		// Expiration time (in seconds) before the cached asset will be re-generated by invoking the Serverless Function.
		// Setting the value to `false` means it will never expire.
		expiration: 3600
	}
}

export const load = (async ({ params }) => {
	const res = await fetch(
		'https://api.open-meteo.com/v1/forecast?latitude=51.503553657200996&longitude=-0.12779310629778032&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m'
	)
	const data = await res.json()

	if (data) {
		return {
			url: PUBLIC_URL,
			pageTitle: 'Heat Strike',
			metadescription:
				"June was the hottest month ever recorded and it will get worse. This summer, send a message to Government that things aren't cool, Rishi",
			temp: data.current_weather.temperature,
			image: {
				url: '/HeatStrike.png',
				alt: 'Heat Strike this summer'
			},
			squareImage: {
				url: '/HeatStroke-sq.png',
				alt: 'Heat Strike this summer'
			}
		}
	}

	throw error(404, 'Not found')
}) satisfies PageServerLoad
