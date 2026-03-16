import { WORDPRESS_URL } from '$env/static/private'

interface WordPressAuthResult {
	authenticated: boolean
	user?: {
		id: number
		name: string
		email: string
		capabilities: string[] | Record<string, boolean>
	}
	token?: string
}

// This function is now simplified since tokens come from URL parameters
export async function checkWordPressAuth(request: Request): Promise<WordPressAuthResult> {
	// This function is kept for backward compatibility but is no longer used
	// in the new token-based flow
	return { authenticated: false }
}

export function canUserPreview(authResult: WordPressAuthResult): boolean {
	// If we have a token, assume the user can preview (token generation validates permissions)
	if (authResult.token) {
		return true
	}

	return authResult.authenticated
}