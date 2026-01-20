'use client';

import { type ReactNode } from 'react';
import { useIsClient } from '@/hooks/use-is-client';

interface ClientOnlyProps {
	children: ReactNode;
	fallback?: ReactNode;
}

// Wrapper component to render children only on the client.
// Prevents hydration mismatches for browser-only content.
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const isClient = useIsClient();
	return isClient ? <>{children}</> : <>{fallback}</>;
}
