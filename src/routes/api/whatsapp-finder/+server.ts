import { OS_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
// Map regions to their WhatsApp group invite links
const WHATSAPP_LINKS: Record<string, string> = {
    'South West': 'https://chat.whatsapp.com/Jd9Wee9nLO7BIf0It7BLwv',
    'London': 'https://chat.whatsapp.com/Cs0l1Jyflzn2IAMtuR6o8K',
    'South East': 'https://chat.whatsapp.com/EPY7BljuAL4Lo7QeRohRbP',
    'East of England': 'https://chat.whatsapp.com/JR5j0Ajzn9qC4A2bXDYpAn',
    'Midlands': 'https://chat.whatsapp.com/FRBBddwKacf4v8akdWSPsi',
    'North of England': 'https://chat.whatsapp.com/Dyel3eLNw7T1wTSRIrFTUh',
    'Cymru': 'https://chat.whatsapp.com/IWgXYRo5ZKP0kzODxlHPFa',
    'Scotland & Northern Ireland': 'https://chat.whatsapp.com/GkxSIbNkSeaGr1siHHdgfw'
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
            const region = determineRegion(result);
            
            return json({
                region: region,
                whatsappLink: WHATSAPP_LINKS[region] || null
            });
        }
        
        return json({ error: 'Postcode not found' }, { status: 404 });
    } catch (error) {
        console.error('Error finding WhatsApp group:', error);
        return json({ error: 'Failed to find WhatsApp group' }, { status: 500 });
    }
}
