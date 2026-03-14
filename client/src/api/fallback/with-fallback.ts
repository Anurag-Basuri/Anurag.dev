/**
 * Fallback pipeline utility.
 *
 * Wraps any async fetcher with automatic fallback:
 * 1. Tries the API call
 * 2. On failure → returns the hardcoded fallback data
 * 3. Logs the failure for debugging
 *
 * Usage:
 *   const data = await withFallback(() => apiClient.get('/projects'), FALLBACK_PROJECTS);
 */
export async function withFallback<T>(
	fetcher: () => Promise<T>,
	fallbackData: T,
	label?: string,
): Promise<{ data: T; source: 'api' | 'fallback' }> {
	try {
		const data = await fetcher();
		return { data, source: 'api' };
	} catch (error) {
		const tag = label || 'unknown';
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.warn(`[Fallback:${tag}] API failed, using fallback data. Reason: ${message}`);
		return { data: fallbackData, source: 'fallback' };
	}
}
