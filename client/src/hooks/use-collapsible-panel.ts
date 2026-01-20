'use client';

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { moduleMaximizedAtom, moduleMinimizedAtom } from '@/store';

export type PanelType = 'module';

export interface CollapsiblePanelConfig {
	type: PanelType;
	onCollapse?: () => void;
	onExpand?: () => void;
	onMaximize?: () => void;
}

export interface CollapsiblePanelReturn {
	isCollapsed: boolean;
	isMaximized?: boolean;
	toggle: () => void;
	expand: () => void;
	collapse: () => void;
	maximize: () => void;
	restore: () => void;
}

// Hook for managing collapsible panel state
// Uses Jotai atoms for module state management
export function useCollapsiblePanel({
	type,
	onCollapse,
	onExpand,
	onMaximize,
}: CollapsiblePanelConfig): CollapsiblePanelReturn {
	const [moduleMinimized, setModuleMinimized] = useAtom(moduleMinimizedAtom);
	const [moduleMaximized, setModuleMaximized] = useAtom(moduleMaximizedAtom);

	const isCollapsed = moduleMinimized;

	const setIsCollapsed = useCallback(
		(val: boolean) => {
			setModuleMinimized(val);
		},
		[setModuleMinimized],
	);

	const toggle = useCallback(() => {
		const next = !isCollapsed;
		setIsCollapsed(next);
		if (next) {
			onCollapse?.();
		} else {
			onExpand?.();
		}
	}, [isCollapsed, onCollapse, onExpand, setIsCollapsed]);

	const expand = useCallback(() => {
		setIsCollapsed(false);
		onExpand?.();
	}, [onExpand, setIsCollapsed]);

	const collapse = useCallback(() => {
		setIsCollapsed(true);
		onCollapse?.();
	}, [onCollapse, setIsCollapsed]);

	const maximize = useCallback(() => {
		setModuleMaximized(true);
		setModuleMinimized(false);
		onExpand?.();
		onMaximize?.();
	}, [onExpand, onMaximize, setModuleMaximized, setModuleMinimized]);

	const restore = useCallback(() => {
		setModuleMaximized(false);
	}, [setModuleMaximized]);

	return {
		isCollapsed,
		isMaximized: moduleMaximized,
		toggle,
		expand,
		collapse,
		maximize,
		restore,
	};
}
