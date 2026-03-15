'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Module ID aliases
const MODULE_ALIASES: Record<string, string> = {
	bio: 'about',
	work: 'projects',
	connect: 'contact',
	certs: 'certifications',
};

// Extract module ID from pathname
function getModuleIdFromPathname(path: string): string | null {
	const segments = path.split('/').filter(Boolean);
	const lastSegment = segments[segments.length - 1];

	if (!lastSegment || lastSegment === 'portfolio') return 'about';

	return MODULE_ALIASES[lastSegment] || lastSegment;
}

interface UseModuleNavigationReturn {
	currentModuleId: string | null;
	handleNavigate: (moduleId: string) => void;
	dismissCurrentModule: () => void;
}

// Hook for module navigation logic
export function useModuleNavigation(): UseModuleNavigationReturn {
	const router = useRouter();
	const pathname = usePathname();

	const currentModuleId = getModuleIdFromPathname(pathname);

	const handleNavigate = useCallback(
		(moduleId: string) => {
			router.push(`/portfolio/${moduleId}`);
		},
		[router],
	);

	const dismissCurrentModule = useCallback(() => {
		router.push('/portfolio');
	}, [router]);

	return {
		currentModuleId,
		handleNavigate,
		dismissCurrentModule,
	};
}
