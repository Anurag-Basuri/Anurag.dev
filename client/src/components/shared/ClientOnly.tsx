'use client';

import React from 'react';

/**
 * Render children only on the client to avoid SSR/hydration issues with browser APIs.
 */
export default function ClientOnly({
	children,
	fallback = null,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	if (!mounted) return <>{fallback}</>;
	return <>{children}</>;
}
