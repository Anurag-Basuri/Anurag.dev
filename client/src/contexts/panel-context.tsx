'use client';

import React, {
	createContext,
	useContext,
	useCallback,
	useState,
	useMemo,
	useEffect,
	type ReactNode,
} from 'react';
import { useAtom } from 'jotai';
import { sidebarCollapsedAtom, terminalCollapsedAtom } from '@/store';
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
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
	setHorizontalGroupRef: React.Dispatch<React.SetStateAction<GroupImperativeHandle | null>>;
	setVerticalGroupRef: React.Dispatch<React.SetStateAction<GroupImperativeHandle | null>>;
	setSidebarPanelRef: React.Dispatch<React.SetStateAction<PanelImperativeHandle | null>>;
	setTerminalPanelRef: React.Dispatch<React.SetStateAction<PanelImperativeHandle | null>>;
}

// ============================================================================
// Context
// ============================================================================

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
	// Use the library's callback ref hooks for proper ref management
	const [horizontalGroup, setHorizontalGroupRef] = useGroupCallbackRef();
	const [verticalGroup, setVerticalGroupRef] = useGroupCallbackRef();

	const [sidebarPanel, setSidebarPanelRef] = usePanelCallbackRef();
	const [terminalPanel, setTerminalPanelRef] = usePanelCallbackRef();

	// Persisted collapsed state
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);

	// Local maximized state
	const [sidebarMaximized, setSidebarMaximized] = useState(false);
	const [terminalMaximized, setTerminalMaximized] = useState(false);

	// ========================================================================
	// Sync panel state on mount/ref change
	// ========================================================================
	useEffect(() => {
		if (!sidebarPanel) return;

		// Sync initial state: if Jotai says collapsed, collapse the panel
		if (sidebarCollapsed && !sidebarPanel.isCollapsed()) {
			sidebarPanel.collapse();
		} else if (!sidebarCollapsed && sidebarPanel.isCollapsed()) {
			sidebarPanel.expand();
		}
	}, [sidebarPanel, sidebarCollapsed]);

	useEffect(() => {
		if (!terminalPanel) return;

		if (terminalCollapsed && !terminalPanel.isCollapsed()) {
			terminalPanel.collapse();
		} else if (!terminalCollapsed && terminalPanel.isCollapsed()) {
			terminalPanel.expand();
		}
	}, [terminalPanel, terminalCollapsed]);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		if (sidebarPanel) {
			sidebarPanel.collapse();
		}
		setSidebarCollapsed(true);
		setSidebarMaximized(false);
	}, [sidebarPanel, setSidebarCollapsed]);

	const expandSidebar = useCallback(() => {
		if (sidebarPanel) {
			sidebarPanel.expand();
		}
		setSidebarCollapsed(false);
		setSidebarMaximized(false);
	}, [sidebarPanel, setSidebarCollapsed]);

	const toggleSidebar = useCallback(() => {
		// Use panel's actual state if available, otherwise use Jotai state
		const isCurrentlyCollapsed = sidebarPanel ? sidebarPanel.isCollapsed() : sidebarCollapsed;

		if (isCurrentlyCollapsed) {
			expandSidebar();
		} else {
			collapseSidebar();
		}
	}, [sidebarPanel, sidebarCollapsed, expandSidebar, collapseSidebar]);

	const toggleMaximizeSidebar = useCallback(() => {
		if (sidebarMaximized) {
			setSidebarMaximized(false);
			horizontalGroup?.setLayout({ sidebar: 20, main: 80 });
		} else {
			setSidebarMaximized(true);
			setSidebarCollapsed(false);
			if (sidebarPanel?.isCollapsed()) {
				sidebarPanel.expand();
			}
			const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
			horizontalGroup?.setLayout({ sidebar: maxSize, main: 100 - maxSize });
		}
	}, [sidebarMaximized, setSidebarCollapsed, sidebarPanel, horizontalGroup]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		if (terminalPanel) {
			terminalPanel.collapse();
		}
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
	}, [terminalPanel, setTerminalCollapsed]);

	const expandTerminal = useCallback(() => {
		if (terminalPanel) {
			terminalPanel.expand();
		}
		setTerminalCollapsed(false);
		setTerminalMaximized(false);
	}, [terminalPanel, setTerminalCollapsed]);

	const toggleTerminal = useCallback(() => {
		const isCurrentlyCollapsed = terminalPanel
			? terminalPanel.isCollapsed()
			: terminalCollapsed;

		if (isCurrentlyCollapsed) {
			expandTerminal();
		} else {
			collapseTerminal();
		}
	}, [terminalPanel, terminalCollapsed, expandTerminal, collapseTerminal]);

	const toggleMaximizeTerminal = useCallback(() => {
		if (terminalMaximized) {
			setTerminalMaximized(false);
			verticalGroup?.setLayout({ content: 60, terminal: 40 });
		} else {
			setTerminalMaximized(true);
			setTerminalCollapsed(false);
			if (terminalPanel?.isCollapsed()) {
				terminalPanel.expand();
			}
			const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
			verticalGroup?.setLayout({ content: 100 - maxSize, terminal: maxSize });
		}
	}, [terminalMaximized, setTerminalCollapsed, terminalPanel, verticalGroup]);

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
			},
			terminal: {
				collapse: collapseTerminal,
				expand: expandTerminal,
				toggle: toggleTerminal,
				toggleMaximize: toggleMaximizeTerminal,
				isCollapsed: terminalCollapsed,
				isMaximized: terminalMaximized,
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
			collapseTerminal,
			expandTerminal,
			toggleTerminal,
			toggleMaximizeTerminal,
			terminalCollapsed,
			terminalMaximized,
			setHorizontalGroupRef,
			setVerticalGroupRef,
			setSidebarPanelRef,
			setTerminalPanelRef,
		],
	);

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
