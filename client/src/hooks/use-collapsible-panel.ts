import { useCallback, useRef, useMemo } from 'react';
import { useAtom } from 'jotai';
import { type ImperativePanelHandle } from '@/components/ui/resizable';
import { layoutStateAtom, sidebarCollapsedAtom, terminalCollapsedAtom } from '@/store/atoms';

export type PanelType = 'sidebar' | 'terminal';

export interface CollapsiblePanelConfig {
	type: PanelType;
	collapsedSize?: number;
	minSize?: number;
	maxSize?: number;
	onCollapse?: () => void;
	onExpand?: () => void;
}

export interface CollapsiblePanelReturn {
	isCollapsed: boolean;
	toggle: () => void;
	expand: () => void;
	collapse: () => void;
	maximize: () => void;
	reset: () => void;
	panelRef: React.RefObject<ImperativePanelHandle>;
	panelProps: {
		ref: React.RefObject<ImperativePanelHandle>;
		collapsible: true;
		collapsedSize: number;
		minSize: number;
		maxSize: number;
		defaultSize: number;
		onCollapse: () => void;
		onExpand: () => void;
		className?: string;
	};
}

export function useCollapsiblePanel({
	type,
	onCollapse,
	onExpand,
}: CollapsiblePanelConfig): CollapsiblePanelReturn {
	// Use legacy atoms for now to maintain compatibility
	const [isCollapsed, setIsCollapsed] = useAtom(
		type === 'sidebar' ? sidebarCollapsedAtom : terminalCollapsedAtom,
	);
	const [layoutState] = useAtom(layoutStateAtom);
	const panelRef = useRef<ImperativePanelHandle>(null!) as React.RefObject<ImperativePanelHandle>;

	const panelConfig = useMemo(() => {
		switch (type) {
			case 'sidebar':
				return {
					defaultSize: layoutState.sidebar.size,
					collapsedSize: 1,
					minSize: 5,
					maxSize: 25,
				};
			case 'terminal':
				return {
					defaultSize: layoutState.terminal.size,
					collapsedSize: 2,
					minSize: 4,
					maxSize: 60,
				};
			default:
				throw new Error(`Unknown panel type: ${type}`);
		}
	}, [type, layoutState]);

	const toggle = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(`[useCollapsiblePanel] Panel ref not available for ${type}`);
			}
			return;
		}

		if (isCollapsed) {
			panel.expand();
		} else {
			panel.collapse();
		}
	}, [isCollapsed, type]);

	const expand = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(`[useCollapsiblePanel] Panel ref not available for ${type}`);
			}
			return;
		}

		// Let the panel handle the state transition
		panel.expand();
	}, [type]);

	const collapse = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(`[useCollapsiblePanel] Panel ref not available for ${type}`);
			}
			return;
		}

		// Let the panel handle the state transition
		// Let the panel handle the state transition
		panel.collapse();
	}, [type]);

	const maximize = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) return;
		panel.resize(panelConfig.maxSize);
	}, [panelConfig.maxSize]);

	const reset = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) return;
		panel.resize(panelConfig.defaultSize);
	}, [panelConfig.defaultSize]);

	const panelProps = useMemo(
		() => ({
			ref: panelRef,
			collapsible: true as const,
			collapsedSize: panelConfig.collapsedSize,
			minSize: panelConfig.minSize,
			maxSize: panelConfig.maxSize,
			defaultSize: panelConfig.defaultSize,
			onCollapse: () => {
				setIsCollapsed(true);
				onCollapse?.();
			},
			onExpand: () => {
				setIsCollapsed(false);
				onExpand?.();
			},
		}),
		[panelConfig, setIsCollapsed, onCollapse, onExpand],
	);

	return {
		isCollapsed,
		toggle,
		expand,
		collapse,
		maximize,
		reset,
		panelRef,
		panelProps,
	};
}
