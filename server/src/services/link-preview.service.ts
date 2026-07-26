// Cache
interface CacheEntry {
	ogImage: string | null;
	timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;
const MAX_HTML_BYTES = 200_000;

// OG image extraction

function extractOgImage(html: string, baseUrl: string): string | null {
	// Try og:image (both attribute orderings)
	const match =
		html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
		html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

	if (!match?.[1]) return null;

	let imageUrl = match[1].trim();

	// Resolve relative URLs
	if (imageUrl.startsWith('//')) {
		imageUrl = 'https:' + imageUrl;
	} else if (imageUrl.startsWith('/')) {
		try {
			const parsed = new URL(baseUrl);
			imageUrl = `${parsed.protocol}//${parsed.host}${imageUrl}`;
		} catch {
			return null;
		}
	}

	// Only allow http(s) URLs
	if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
		return null;
	}

	return imageUrl;
}

// Public API
export async function getOgImage(url: string): Promise<string | null> {
	// Check cache first
	const cached = cache.get(url);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
		return cached.ogImage;
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

		const res = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://portfolio.dev)',
				Accept: 'text/html,application/xhtml+xml,*/*',
			},
			redirect: 'follow',
		});
		clearTimeout(timeout);

		const contentType = res.headers.get('content-type') || '';

		// If the URL itself returns an image, that IS the image
		if (contentType.startsWith('image/')) {
			cache.set(url, { ogImage: url, timestamp: Date.now() });
			return url;
		}

		// Only parse HTML responses for OG tags
		if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
			cache.set(url, { ogImage: null, timestamp: Date.now() });
			return null;
		}

		// Read a limited amount of HTML (OG tags are always in <head>)
		const reader = res.body?.getReader();
		if (!reader) {
			cache.set(url, { ogImage: null, timestamp: Date.now() });
			return null;
		}

		let html = '';
		const decoder = new TextDecoder();
		let bytesRead = 0;

		while (bytesRead < MAX_HTML_BYTES) {
			const { done, value } = await reader.read();
			if (done) break;
			html += decoder.decode(value, { stream: true });
			bytesRead += value.length;
			// Stop early if we've passed </head>
			if (html.includes('</head>') || html.includes('</HEAD>')) break;
		}
		reader.cancel().catch(() => {});

		const ogImage = extractOgImage(html, url);
		cache.set(url, { ogImage, timestamp: Date.now() });
		return ogImage;
	} catch {
		cache.set(url, { ogImage: null, timestamp: Date.now() });
		return null;
	}
}
