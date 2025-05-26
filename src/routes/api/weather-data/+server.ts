import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const weatherRes = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=51.503553657200996&longitude=-0.12779310629778032&current=temperature_2m'
        );

        if (!weatherRes.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherRes.json();
        const temperature = weatherData.current.temperature_2m;

        return json({ temperature: Math.round(temperature) });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}