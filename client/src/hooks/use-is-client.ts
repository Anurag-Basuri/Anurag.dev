'use client';

import { useState, useEffect } from 'react';

// Hook to safely detect client-side rendering.
// Returns false during SSR and true after hydration.
// Use this to prevent hydration mismatches for browser-only content.
export function useIsClient(): boolean {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return isClient;
}
