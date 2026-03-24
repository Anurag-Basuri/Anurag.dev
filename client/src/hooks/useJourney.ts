import { useEffect, useState, useMemo, useCallback } from 'react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';

/**
 * Module-level cache so both Experience and Education modules
 * share a single API call for the same journey data.
 * Includes a timestamp for staleness-based invalidation.
 */
let cachedData: JourneyEntry[] | null = null;
let fetchPromise: Promise<JourneyEntry[]> | null = null;
let cachedAt: number = 0;

/** Cache TTL: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

function fetchJourney(force = false): Promise<JourneyEntry[]> {
	// Return cached data if fresh
	if (!force && cachedData && Date.now() - cachedAt < CACHE_TTL_MS) {
		return Promise.resolve(cachedData);
	}

	// Reuse in-flight request
	if (fetchPromise) return fetchPromise;

	fetchPromise = publicService
		.getJourney()
		.then(({ data }) => {
			cachedData = data || [];
			cachedAt = Date.now();
			fetchPromise = null;
			return cachedData;
		})
		.catch(err => {
			fetchPromise = null; // Allow retry on failure
			throw err;
		});

	return fetchPromise;
}

/** Manually invalidate the cache (e.g., after admin edits) */
export function invalidateJourneyCache(): void {
	cachedData = null;
	fetchPromise = null;
	cachedAt = 0;
}

/**
 * Shared hook that fetches journey entries once and caches them.
 * Filters by type so each module gets only what it needs.
 * Cache auto-expires after 5 minutes.
 */
export function useJourney(type: 'WORK' | 'EDUCATION') {
	const [entries, setEntries] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);

	const refetch = useCallback(() => {
		setLoading(true);
		fetchJourney(true)
			.then(data => setEntries(data))
			.catch(err => console.error('Failed to load journey data', err))
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		let cancelled = false;
		fetchJourney()
			.then(data => {
				if (!cancelled) setEntries(data);
			})
			.catch(err => {
				console.error('Failed to load journey data', err);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, []);

	const filtered = useMemo(
		() => entries.filter(e => e.type.toUpperCase() === type),
		[entries, type],
	);

	return { entries: filtered, loading, refetch };
}
