'use client';

import React, {
	createContext,
	useContext,
	useCallback,
	useState,
	useMemo,
	type ReactNode,
} from 'react';
import { useAtom } from 'jotai';
import {
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
	mainHorizontalSizesAtom,
	mainVerticalSizesAtom,
} from '@/store';
import { PANEL_CONFIG } from '@/lib/constants';
import {
	useGroupCallbackRef,
	usePanelCallbackRef,
	type GroupImperativeHandle,
	type PanelImperativeHandle,
} from 'react-resizable-panels';

// ============================================================================
// Types
// ============================================================================

interface PanelControls {
	collapse: () => void;
	expand: () => void;
	toggle: () => void;
	toggleMaximize: () => void;
	isCollapsed: boolean;
	isMaximized: boolean;
	onCollapse: () => void;
	onExpand: () => void;
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
	setHorizontalGroupRef: React.Dispatch<React.SetStateAction<GroupImperativeHandle | null>>;
	setVerticalGroupRef: React.Dispatch<React.SetStateAction<GroupImperativeHandle | null>>;
	setSidebarPanelRef: React.Dispatch<React.SetStateAction<PanelImperativeHandle | null>>;
	setTerminalPanelRef: React.Dispatch<React.SetStateAction<PanelImperativeHandle | null>>;
}

const PanelContext = createContext<PanelContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

export function usePanelControls() {
	const context = useContext(PanelContext);
	if (!context) {
		throw new Error('usePanelControls must be used within a PanelProvider');
	}
	return context;
}

// ============================================================================
// Provider
// ============================================================================

export function PanelProvider({ children }: { children: ReactNode }) {
	// Panel refs from library
	const [, setHorizontalGroupRef] = useGroupCallbackRef();
	const [, setVerticalGroupRef] = useGroupCallbackRef();
	const [sidebarPanel, setSidebarPanelRef] = usePanelCallbackRef();
	const [terminalPanel, setTerminalPanelRef] = usePanelCallbackRef();

	// Persisted collapsed state (single source of truth)
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);

	// Persisted sizes for restore
	const [hSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes] = useAtom(mainVerticalSizesAtom);

	// Local maximized state
	const [sidebarMaximized, setSidebarMaximized] = useState(false);
	const [terminalMaximized, setTerminalMaximized] = useState(false);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		sidebarPanel?.collapse();
		setSidebarCollapsed(true);
		setSidebarMaximized(false);
	}, [sidebarPanel, setSidebarCollapsed]);

	const expandSidebar = useCallback(() => {
		sidebarPanel?.expand();
		setSidebarCollapsed(false);
		setSidebarMaximized(false);
	}, [sidebarPanel, setSidebarCollapsed]);

	const toggleSidebar = useCallback(() => {
		if (sidebarCollapsed) {
			expandSidebar();
		} else {
			collapseSidebar();
		}
	}, [sidebarCollapsed, expandSidebar, collapseSidebar]);

	const toggleMaximizeSidebar = useCallback(() => {
		if (sidebarMaximized) {
			setSidebarMaximized(false);
			// Restore to persisted size
			const restoreSize =
				hSizes?.[0] ?? parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize);
			sidebarPanel?.resize(restoreSize);
		} else {
			setSidebarMaximized(true);
			setSidebarCollapsed(false);
			if (sidebarPanel?.isCollapsed()) {
				sidebarPanel.expand();
			}
			const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
			sidebarPanel?.resize(maxSize);
		}
	}, [sidebarMaximized, setSidebarCollapsed, sidebarPanel, hSizes]);

	// Callbacks for Panel component (called by react-resizable-panels)
	const onSidebarCollapse = useCallback(() => {
		setSidebarCollapsed(true);
		setSidebarMaximized(false);
	}, [setSidebarCollapsed]);

	const onSidebarExpand = useCallback(() => {
		setSidebarCollapsed(false);
	}, [setSidebarCollapsed]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		terminalPanel?.collapse();
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
	}, [terminalPanel, setTerminalCollapsed]);

	const expandTerminal = useCallback(() => {
		terminalPanel?.expand();
		setTerminalCollapsed(false);
		setTerminalMaximized(false);
	}, [terminalPanel, setTerminalCollapsed]);

	const toggleTerminal = useCallback(() => {
		if (terminalCollapsed) {
			expandTerminal();
		} else {
			collapseTerminal();
		}
	}, [terminalCollapsed, expandTerminal, collapseTerminal]);

	const toggleMaximizeTerminal = useCallback(() => {
		if (terminalMaximized) {
			setTerminalMaximized(false);
			// Restore to persisted size
			const restoreSize =
				vSizes?.[1] ?? parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize);
			terminalPanel?.resize(restoreSize);
		} else {
			setTerminalMaximized(true);
			setTerminalCollapsed(false);
			if (terminalPanel?.isCollapsed()) {
				terminalPanel.expand();
			}
			const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
			terminalPanel?.resize(maxSize);
		}
	}, [terminalMaximized, setTerminalCollapsed, terminalPanel, vSizes]);

	// Callbacks for Panel component (called by react-resizable-panels)
	const onTerminalCollapse = useCallback(() => {
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
	}, [setTerminalCollapsed]);

	const onTerminalExpand = useCallback(() => {
		setTerminalCollapsed(false);
	}, [setTerminalCollapsed]);

	// ========================================================================
	// Context Value - memoized to prevent unnecessary re-renders
	// ========================================================================

	const value = useMemo<PanelContextValue>(
		() => ({
			sidebar: {
				collapse: collapseSidebar,
				expand: expandSidebar,
				toggle: toggleSidebar,
				toggleMaximize: toggleMaximizeSidebar,
				isCollapsed: sidebarCollapsed,
				isMaximized: sidebarMaximized,
				onCollapse: onSidebarCollapse,
				onExpand: onSidebarExpand,
			},
			terminal: {
				collapse: collapseTerminal,
				expand: expandTerminal,
				toggle: toggleTerminal,
				toggleMaximize: toggleMaximizeTerminal,
				isCollapsed: terminalCollapsed,
				isMaximized: terminalMaximized,
				onCollapse: onTerminalCollapse,
				onExpand: onTerminalExpand,
			},
			setHorizontalGroupRef,
			setVerticalGroupRef,
			setSidebarPanelRef,
			setTerminalPanelRef,
		}),
		[
			collapseSidebar,
			expandSidebar,
			toggleSidebar,
			toggleMaximizeSidebar,
			sidebarCollapsed,
			sidebarMaximized,
			onSidebarCollapse,
			onSidebarExpand,
			collapseTerminal,
			expandTerminal,
			toggleTerminal,
			toggleMaximizeTerminal,
			terminalCollapsed,
			terminalMaximized,
			onTerminalCollapse,
			onTerminalExpand,
			setHorizontalGroupRef,
			setVerticalGroupRef,
			setSidebarPanelRef,
			setTerminalPanelRef,
		],
	);

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
