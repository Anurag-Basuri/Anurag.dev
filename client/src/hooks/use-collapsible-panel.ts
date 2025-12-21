'use client';

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import {
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
	moduleMaximizedAtom,
	moduleMinimizedAtom,
} from '@/store';

export type PanelType = 'sidebar' | 'terminal' | 'module';

export interface CollapsiblePanelConfig {
	type: PanelType;
	onCollapse?: () => void;
	onExpand?: () => void;
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

export function useCollapsiblePanel({
	type,
	onCollapse,
	onExpand,
}: CollapsiblePanelConfig): CollapsiblePanelReturn {
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);
	const [moduleMinimized, setModuleMinimized] = useAtom(moduleMinimizedAtom);
	const [moduleMaximized, setModuleMaximized] = useAtom(moduleMaximizedAtom);

	const isCollapsed =
		type === 'sidebar'
			? sidebarCollapsed
			: type === 'terminal'
			? terminalCollapsed
			: moduleMinimized;

	const setIsCollapsed = (val: boolean) => {
		if (type === 'sidebar') setSidebarCollapsed(val);
		else if (type === 'terminal') setTerminalCollapsed(val);
		else setModuleMinimized(val);
	};

	const toggle = useCallback(() => {
		const next = !isCollapsed;
		setIsCollapsed(next);
		if (next) {
			onCollapse?.();
		} else {
			onExpand?.();
		}
	}, [isCollapsed, onCollapse, onExpand, type]);

	const expand = useCallback(() => {
		setIsCollapsed(false);
		onExpand?.();
	}, [onExpand, type]);

	const collapse = useCallback(() => {
		setIsCollapsed(true);
		onCollapse?.();
	}, [onCollapse, type]);

	const maximize = useCallback(() => {
		if (type === 'module') {
			setModuleMaximized(true);
			setModuleMinimized(false);
		} else {
			setIsCollapsed(false);
		}
		onExpand?.();
	}, [onExpand, type, setModuleMaximized, setModuleMinimized]);

	const restore = useCallback(() => {
		if (type === 'module') {
			setModuleMaximized(false);
		}
	}, [setModuleMaximized, type]);

	return {
		isCollapsed,
		isMaximized: type === 'module' ? moduleMaximized : false,
		toggle,
		expand,
		collapse,
		maximize,
		restore,
	};
}
