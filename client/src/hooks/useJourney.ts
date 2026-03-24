import { useEffect, useState, useMemo } from 'react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';

/**
 * Module-level cache so both Experience and Education modules
 * share a single API call for the same journey data.
 */
let cachedData: JourneyEntry[] | null = null;
let fetchPromise: Promise<JourneyEntry[]> | null = null;

function fetchJourney(): Promise<JourneyEntry[]> {
	if (cachedData) return Promise.resolve(cachedData);
	if (fetchPromise) return fetchPromise;

	fetchPromise = publicService
		.getJourney()
		.then(({ data }) => {
			cachedData = data || [];
			return cachedData;
		})
		.catch(err => {
			fetchPromise = null; // Allow retry on failure
			throw err;
		});

	return fetchPromise;
}

/**
 * Shared hook that fetches journey entries once and caches them.
 * Filters by type so each module gets only what it needs.
 */
export function useJourney(type: 'WORK' | 'EDUCATION') {
	const [entries, setEntries] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);

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

	return { entries: filtered, loading };
}
