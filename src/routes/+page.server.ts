import { PUBLIC_URL } from '$env/static/public';
import { AN_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { PersonResponse } from '$lib/types'

export const config = {
    isr: {
        expiration: 3600
    }
};

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email');
        const firstname = data.get('firstname');
        const lastname = data.get('lastname');

        const activistObject = {
            person: {
                family_name: lastname,
                given_name: firstname,
                email_addresses: [{ address: email }]
            },
            add_tags: ['Website signup', 'Test user']
        };

        try {
            const response = await fetch('https://actionnetwork.org/api/v2/people', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'OSDI-API-Token': AN_KEY
                },
                body: JSON.stringify(activistObject)
            });

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    status: response.status,
                    error: errorData,
                    success: false
                };
            }

            const responseData = await response.json();
            const data: PersonResponse = {
                given_name: responseData.given_name,
                family_name: responseData.family_name,
                email: responseData.email_addresses[0].address
            };
            return {
                status: 200,
                success: true,
                data
            };
        } catch (err) {
            return {
                status: 500,
                error: err.message,
                success: false
            };
        }
    }
} satisfies Actions;

export const load = (async ({ params }) => {
    const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.503553657200996&longitude=-0.12779310629778032&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m'
    );
    const data = await res.json();

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
        };
    }

    throw error(404, 'Not found');
}) satisfies PageServerLoad;
