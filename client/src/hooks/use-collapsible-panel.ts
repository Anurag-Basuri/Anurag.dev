import { useCallback, useRef, useMemo } from 'react';
import { useAtom } from 'jotai';
import { type ImperativePanelHandle } from '@/components/ui/resizable';
import { 
	layoutStateAtom, 
	sidebarCollapsedAtom, 
	terminalCollapsedAtom,
} from '@/store/atoms';

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
		type === 'sidebar' ? sidebarCollapsedAtom : terminalCollapsedAtom
	);
	const [layoutState] = useAtom(layoutStateAtom);
	const panelRef = useRef<ImperativePanelHandle>(null!) as React.RefObject<ImperativePanelHandle>;

	const panelConfig = useMemo(() => {
		switch (type) {
			case 'sidebar':
				return {
					defaultSize: layoutState.sidebar.size,
					collapsedSize: 4, // 64px
					minSize: 15,
					maxSize: 25,
				};
			case 'terminal':
				return {
					defaultSize: layoutState.terminal.size,
					collapsedSize: 3.5, // 56px
					minSize: 10,
					maxSize: 50,
				};
			default:
				throw new Error(`Unknown panel type: ${type}`);
		}
	}, [type, layoutState]);

	const toggle = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) return;

		if (panel.isCollapsed()) {
			panel.expand();
			setIsCollapsed(false);
			onExpand?.();
		} else {
			panel.collapse();
			setIsCollapsed(true);
			onCollapse?.();
		}
	}, [setIsCollapsed, onCollapse, onExpand]);

	const expand = useCallback(() => {
		const panel = panelRef.current;
		if (!panel || !panel.isCollapsed()) return;
		
		panel.expand();
		setIsCollapsed(false);
		onExpand?.();
	}, [setIsCollapsed, onExpand]);

	const collapse = useCallback(() => {
		const panel = panelRef.current;
		if (!panel || panel.isCollapsed()) return;
		
		panel.collapse();
		setIsCollapsed(true);
		onCollapse?.();
	}, [setIsCollapsed, onCollapse]);

	const panelProps = useMemo(() => ({
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
		className: `transition-all duration-300 ease-in-out ${
			isCollapsed 
				? type === 'sidebar' ? 'min-w-[64px]!' : 'min-h-[56px]!'
				: ''
		}`,
	}), [panelConfig, type, isCollapsed, setIsCollapsed, onCollapse, onExpand]);

	return {
		isCollapsed,
		toggle,
		expand,
		collapse,
		panelRef,
		panelProps,
	};
}