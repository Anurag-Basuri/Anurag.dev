// Fallback pipeline utility.
// This function attempts to fetch data using the provided fetcher function.
// If the fetcher fails (e.g., due to network issues), it logs a warning and returns the provided fallback data instead.
// How to use:
// 1. Define a fetcher function that retrieves data from the API.
// 2. Prepare fallback data that matches the expected structure of the API response.
// 3. Call withFallback(fetcher, fallbackData, 'optional-label') to get the data, which will be from the API if successful, or from the fallback if the API call fails.

export async function withFallback<T>(
	fetcher: () => Promise<T>,
	fallbackData: T,
	label?: string,
): Promise<{ data: T; source: 'api' | 'fallback' }> {
	const tag = label || 'unknown';

	try {
		const data = await fetcher();

		// If the API returned null/undefined, use fallback data instead
		if (data === null || data === undefined) {
			console.warn(`[Fallback:${tag}] API returned empty data, using fallback.`);
			return { data: fallbackData, source: 'fallback' };
		}

		return { data, source: 'api' };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.warn(`[Fallback:${tag}] API failed, using fallback data. Reason: ${message}`);
		return { data: fallbackData, source: 'fallback' };
	}
}
