import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { sidebarCollapsedAtom, terminalCollapsedAtom } from '@/store';

export type PanelType = 'sidebar' | 'terminal';

export interface CollapsiblePanelConfig {
	type: PanelType;
	onCollapse?: () => void;
	onExpand?: () => void;
}

export interface CollapsiblePanelReturn {
	isCollapsed: boolean;
	toggle: () => void;
	expand: () => void;
	collapse: () => void;
	maximize: () => void;
}

export function useCollapsiblePanel({
	type,
	onCollapse,
	onExpand,
}: CollapsiblePanelConfig): CollapsiblePanelReturn {
	const [isCollapsed, setIsCollapsed] = useAtom(
		type === 'sidebar' ? sidebarCollapsedAtom : terminalCollapsedAtom,
	);

	const toggle = useCallback(() => {
		setIsCollapsed(!isCollapsed);
		if (!isCollapsed) {
			onCollapse?.();
		} else {
			onExpand?.();
		}
	}, [isCollapsed, setIsCollapsed, onCollapse, onExpand]);

	const expand = useCallback(() => {
		setIsCollapsed(false);
		onExpand?.();
	}, [setIsCollapsed, onExpand]);

	const collapse = useCallback(() => {
		setIsCollapsed(true);
		onCollapse?.();
	}, [setIsCollapsed, onCollapse]);

	const maximize = useCallback(() => {
		// In fixed layout, maximize just means expand
		setIsCollapsed(false);
		onExpand?.();
	}, [setIsCollapsed, onExpand]);

	return {
		isCollapsed,
		toggle,
		expand,
		collapse,
		maximize,
	};
}
