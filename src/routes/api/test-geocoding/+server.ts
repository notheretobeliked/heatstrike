import { OS_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Cache postcode lookups for 24 hours (in seconds)
export const config = {
    isr: {
        expiration: 86400 // 24 hours
    }
};

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

export const GET: RequestHandler = async ({ url }) => {
    const postcode = url.searchParams.get('postcode');
    
    if (!postcode) {
        return json({ error: 'Postcode is required' }, { status: 400 });
    }

    try {
        // Use OS Names API to search for the postcode
        const namesApiUrl = `https://api.os.uk/search/names/v1/find?query=${encodeURIComponent(postcode)}&maxresults=1&fq=LOCAL_TYPE:Postcode&key=${OS_KEY}`;
        const response = await fetch(namesApiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OS Names API error:', errorText);
            return json({ error: 'Failed to fetch from OS Names API', details: errorText }, { status: response.status });
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0].GAZETTEER_ENTRY;
            
            // Return processed location data
            return json({
                lat: result.GEOMETRY_Y / 100000, // Convert to decimal degrees
                lng: result.GEOMETRY_X / 100000, // Convert to decimal degrees
                region: determineRegion(result),
                components: {
                    locality: result.POPULATED_PLACE,
                    county: result.COUNTY_UNITARY,
                    region: result.REGION,
                    country: result.COUNTRY
                }
            });
        }
        
        return json({ error: 'Postcode not found' }, { status: 404 });
    } catch (error) {
        console.error('Error testing geocoding:', error);
        return json({ error: 'Failed to test geocoding' }, { status: 500 });
    }
} 