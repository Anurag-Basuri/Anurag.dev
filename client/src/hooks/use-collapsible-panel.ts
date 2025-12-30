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

export function useCollapsiblePanel({
	type,
	onCollapse,
	onExpand,
	onMaximize,
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

	const setIsCollapsed = useCallback(
		(val: boolean) => {
			if (type === 'sidebar') setSidebarCollapsed(val);
			else if (type === 'terminal') setTerminalCollapsed(val);
			else setModuleMinimized(val);
		},
		[type, setSidebarCollapsed, setTerminalCollapsed, setModuleMinimized],
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
		if (type === 'module') {
			setModuleMaximized(true);
			setModuleMinimized(false);
		} else if (type === 'sidebar') {
			// When sidebar maximizes, collapse terminal
			setTerminalCollapsed(true);
			setIsCollapsed(false);
		} else if (type === 'terminal') {
			// When terminal maximizes, collapse sidebar
			setSidebarCollapsed(true);
			setIsCollapsed(false);
		}
		onExpand?.();
		onMaximize?.();
	}, [
		onExpand,
		onMaximize,
		setIsCollapsed,
		setModuleMaximized,
		setModuleMinimized,
		setSidebarCollapsed,
		setTerminalCollapsed,
		type,
	]);

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
