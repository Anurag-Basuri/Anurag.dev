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
import { sidebarCollapsedAtom, terminalCollapsedAtom } from '@/store';
import { PANEL_CONFIG } from '@/lib/constants';
import { useGroupCallbackRef, type GroupImperativeHandle } from 'react-resizable-panels';

// ============================================================================
// Types
// ============================================================================

interface PanelControls {
	collapse: () => void;
	expand: () => void;
	toggle: () => void;
	toggleMaximize: () => void;
	setCollapsedState: (collapsed: boolean) => void;
	isCollapsed: boolean;
	isMaximized: boolean;
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
	// Callback refs for proper connection
	setHorizontalGroupRef: React.Dispatch<React.SetStateAction<GroupImperativeHandle | null>>;
	setVerticalGroupRef: React.Dispatch<React.SetStateAction<GroupImperativeHandle | null>>;
}

interface PanelProviderProps {
	children: ReactNode;
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

export function PanelProvider({ children }: PanelProviderProps) {
	// Use the library's callback ref hooks for proper ref management
	const [horizontalGroup, setHorizontalGroupRef] = useGroupCallbackRef();
	const [verticalGroup, setVerticalGroupRef] = useGroupCallbackRef();

	// Jotai atoms for persisted collapsed state
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);

	// Local state for maximized (not persisted)
	const [sidebarMaximized, setSidebarMaximized] = useState(false);
	const [terminalMaximized, setTerminalMaximized] = useState(false);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		setSidebarCollapsed(true);
		setSidebarMaximized(false);
		if (horizontalGroup) {
			horizontalGroup.setLayout({ sidebar: 3, main: 97 });
		}
	}, [setSidebarCollapsed, horizontalGroup]);

	const expandSidebar = useCallback(() => {
		setSidebarCollapsed(false);
		setSidebarMaximized(false);
		if (horizontalGroup) {
			horizontalGroup.setLayout({ sidebar: 20, main: 80 });
		}
	}, [setSidebarCollapsed, horizontalGroup]);

	const toggleSidebar = useCallback(() => {
		if (sidebarCollapsed) {
			expandSidebar();
		} else {
			collapseSidebar();
		}
	}, [sidebarCollapsed, collapseSidebar, expandSidebar]);

	const toggleMaximizeSidebar = useCallback(() => {
		if (sidebarMaximized) {
			setSidebarMaximized(false);
			if (horizontalGroup) {
				horizontalGroup.setLayout({ sidebar: 20, main: 80 });
			}
		} else {
			setSidebarMaximized(true);
			setSidebarCollapsed(false);
			const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
			if (horizontalGroup) {
				horizontalGroup.setLayout({ sidebar: maxSize, main: 100 - maxSize });
			}
		}
	}, [sidebarMaximized, setSidebarCollapsed, horizontalGroup]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
		if (verticalGroup) {
			verticalGroup.setLayout({ content: 97, terminal: 3 });
		}
	}, [setTerminalCollapsed, verticalGroup]);

	const expandTerminal = useCallback(() => {
		setTerminalCollapsed(false);
		setTerminalMaximized(false);
		if (verticalGroup) {
			verticalGroup.setLayout({ content: 60, terminal: 40 });
		}
	}, [setTerminalCollapsed, verticalGroup]);

	const toggleTerminal = useCallback(() => {
		if (terminalCollapsed) {
			expandTerminal();
		} else {
			collapseTerminal();
		}
	}, [terminalCollapsed, collapseTerminal, expandTerminal]);

	const toggleMaximizeTerminal = useCallback(() => {
		if (terminalMaximized) {
			setTerminalMaximized(false);
			if (verticalGroup) {
				verticalGroup.setLayout({ content: 60, terminal: 40 });
			}
		} else {
			setTerminalMaximized(true);
			setTerminalCollapsed(false);
			const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
			if (verticalGroup) {
				verticalGroup.setLayout({ content: 100 - maxSize, terminal: maxSize });
			}
		}
	}, [terminalMaximized, setTerminalCollapsed, verticalGroup]);

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
				setCollapsedState: setSidebarCollapsed,
				isCollapsed: sidebarCollapsed,
				isMaximized: sidebarMaximized,
			},
			terminal: {
				collapse: collapseTerminal,
				expand: expandTerminal,
				toggle: toggleTerminal,
				toggleMaximize: toggleMaximizeTerminal,
				setCollapsedState: setTerminalCollapsed,
				isCollapsed: terminalCollapsed,
				isMaximized: terminalMaximized,
			},
			setHorizontalGroupRef,
			setVerticalGroupRef,
		}),
		[
			collapseSidebar,
			expandSidebar,
			toggleSidebar,
			toggleMaximizeSidebar,
			setSidebarCollapsed,
			sidebarCollapsed,
			sidebarMaximized,
			collapseTerminal,
			expandTerminal,
			toggleTerminal,
			toggleMaximizeTerminal,
			setTerminalCollapsed,
			terminalCollapsed,
			terminalMaximized,
			setHorizontalGroupRef,
			setVerticalGroupRef,
		],
	);

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
