import PageMeta from '$lib/graphql/query/menu.graphql?raw'
import type { LayoutAPIResponse } from '$lib/types/wp-types'
import { checkResponse, graphqlQuery } from '$lib/utilities/graphql'
import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { PUBLIC_SITE_URL } from '$env/static/public';



export const load: PageServerLoad = async function load({ params }: { params: { all?: string } }) {
  const uri = `/${params.all || ''}`

  try {
    const response = await graphqlQuery(PageMeta, { uri: uri })
    checkResponse(response)

    const { data }: { data: LayoutAPIResponse } = await response.json()

    // Handle case where page data doesn't exist
    if (!data.page || !data.page.seo) {
      // Return only menu data if page doesn't exist
      return {
        menu: data.menu ? data.menu : null,
        uri: uri,
      }
    }

		const weatherRes = await fetch(
			'https://api.open-meteo.com/v1/forecast?latitude=51.503553657200996&longitude=-0.12779310629778032&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m'
		)
		const weatherData = await weatherRes.json()


    // Modify menu items to add 'current' key
    if (data.menu && data.menu.menuItems && data.menu.menuItems.nodes) {
      data.menu.menuItems.nodes = data.menu.menuItems.nodes.map(node => ({
        ...node,
        current: node.uri === uri,
      }))
    }

    let siteUrl = uri;
    if (data.page.seo.opengraphUrl) {
      siteUrl = data.page.seo.opengraphUrl.replace(
        new URL(data.page.seo.opengraphUrl).origin, 
        PUBLIC_SITE_URL
      );
    }

    return {
      data: data,
      temp: weatherData.current_weather.temperature,
      menu: data.menu,
      seo: { ...data.page.seo, opengraphUrl: siteUrl },
      uri: uri,
    }
  } catch (err: unknown) {
    console.error("Error in layout load:", err);
    
    // Check if this is a 404 error and pass it through
    const httpError = err as { status?: number; message?: string; body?: { message?: string } };
    if (httpError.status === 404 || 
        (httpError.message && httpError.message.includes('not found')) ||
        (httpError.body && httpError.body.message && httpError.body.message.includes('not found'))) {
      // Pass along 404 errors so they can be handled by the error page
      // Just return minimal data for the layout
      return {
        menu: null,
        uri: uri,
      }
    }
    
    // Return minimal data to prevent layout from failing
    return {
      menu: null,
      uri: uri,
    }
  }
}
