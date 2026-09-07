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
	const isBrowser = typeof window !== 'undefined';
	const deviceBucket =
		isBrowser &&
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			window.navigator.userAgent,
		)
			? 'mobile'
			: 'desktop';

	try {
		const data = await fetcher();

		// If the API returned null/undefined, use fallback data instead
		if (data === null || data === undefined) {
			console.warn(`[Fallback:${tag}] API returned empty data, using fallback.`);
			if (isBrowser) {
				const stats = (
					window as Window & {
						__portfolioFallbackStats?: {
							total: number;
							byTag: Record<string, number>;
							byDevice: Record<string, number>;
						};
					}
				).__portfolioFallbackStats ?? {
					total: 0,
					byTag: {},
					byDevice: {},
				};
				stats.total += 1;
				stats.byTag[tag] = (stats.byTag[tag] ?? 0) + 1;
				stats.byDevice[deviceBucket] = (stats.byDevice[deviceBucket] ?? 0) + 1;
				(
					window as Window & { __portfolioFallbackStats?: typeof stats }
				).__portfolioFallbackStats = stats;
			}
			return { data: fallbackData, source: 'fallback' };
		}

		return { data, source: 'api' };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.warn(`[Fallback:${tag}] API request failed, using fallback data. Reason: ${message}`);
		if (isBrowser) {
			const stats = (
				window as Window & {
					__portfolioFallbackStats?: {
						total: number;
						byTag: Record<string, number>;
						byDevice: Record<string, number>;
					};
				}
			).__portfolioFallbackStats ?? {
				total: 0,
				byTag: {},
				byDevice: {},
			};
			stats.total += 1;
			stats.byTag[tag] = (stats.byTag[tag] ?? 0) + 1;
			stats.byDevice[deviceBucket] = (stats.byDevice[deviceBucket] ?? 0) + 1;
			(
				window as Window & { __portfolioFallbackStats?: typeof stats }
			).__portfolioFallbackStats = stats;
		}
		return { data: fallbackData, source: 'fallback' };
	}
}
