'use client';

/**
 * Client-side shell that wraps the app with providers + 3D background.
 * Loaded dynamically from the root server-side layout to avoid SSG issues.
 */

import type { ReactNode } from 'react';
import { AppProviders } from '@/layout/AppProviders';
import { Scene3D } from '@/theme/Scene3D';

export default function ClientShell({ children }: { children: ReactNode }) {
	return (
		<AppProviders>
			<Scene3D />
			{children}
		</AppProviders>
	);
}
