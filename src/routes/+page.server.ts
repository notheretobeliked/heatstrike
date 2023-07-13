import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {
	const res = await fetch(
		'https://api.open-meteo.com/v1/forecast?latitude=51.503553657200996&longitude=-0.12779310629778032&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m'
	)
	const data = await res.json()

	if (data) {
		return {
			temp: data.current_weather.temperature
		}
	}

	throw error(404, 'Not found')
}) satisfies PageServerLoad
