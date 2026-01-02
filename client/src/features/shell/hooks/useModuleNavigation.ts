'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import { openFilesAtom } from '@/store';
import type { FileSystemItem } from '@/data/filesystem';

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

	if (!lastSegment || lastSegment === 'portfolio') return null;

	return MODULE_ALIASES[lastSegment] || lastSegment;
}

interface UseModuleNavigationReturn {
	currentModuleId: string | null;
	openFiles: { moduleId: string; openedAt: number }[];
	handleFileSelect: (item: FileSystemItem) => void;
	dismissCurrentModule: () => void;
	getNextModuleAfterClose: (closingModuleId: string) => string | null;
}

// Hook for module navigation logic
export function useModuleNavigation(modulePanel: {
	isMaximized: boolean;
	restore: () => void;
	collapse: () => void;
	expand: () => void;
}): UseModuleNavigationReturn {
	const router = useRouter();
	const pathname = usePathname();
	const [openFiles, setOpenFiles] = useAtom(openFilesAtom);

	const currentModuleId = getModuleIdFromPathname(pathname);

	// Track open files
	useEffect(() => {
		if (!currentModuleId) return;

		setOpenFiles(prev => {
			const existingIndex = prev.findIndex(f => f.moduleId === currentModuleId);
			if (existingIndex !== -1) {
				const updated = [...prev];
				const [existing] = updated.splice(existingIndex, 1);
				return [...updated, { ...existing, openedAt: Date.now() }];
			}
			return [...prev, { moduleId: currentModuleId, openedAt: Date.now() }];
		});
	}, [pathname, currentModuleId, setOpenFiles]);

	// Expand panel when module is selected
	useEffect(() => {
		if (currentModuleId) modulePanel.expand();
	}, [currentModuleId, modulePanel]);

	const getNextModuleAfterClose = useCallback(
		(closingModuleId: string) => {
			const remaining = openFiles.filter(f => f.moduleId !== closingModuleId);
			return remaining.length > 0 ? remaining[remaining.length - 1].moduleId : null;
		},
		[openFiles],
	);

	const dismissCurrentModule = useCallback(() => {
		if (!currentModuleId) return;

		const nextModule = getNextModuleAfterClose(currentModuleId);
		setOpenFiles(prev => prev.filter(f => f.moduleId !== currentModuleId));

		if (modulePanel.isMaximized) modulePanel.restore();
		modulePanel.collapse();

		if (nextModule) router.push(`/portfolio/${nextModule}`);
		else router.push('/portfolio');
	}, [currentModuleId, getNextModuleAfterClose, modulePanel, router, setOpenFiles]);

	const handleFileSelect = useCallback(
		(item: FileSystemItem) => {
			if (item.type === 'file' && item.moduleId) {
				router.push(`/portfolio/${item.moduleId}`);
			}
		},
		[router],
	);

	return {
		currentModuleId,
		openFiles,
		handleFileSelect,
		dismissCurrentModule,
		getNextModuleAfterClose,
	};
}
