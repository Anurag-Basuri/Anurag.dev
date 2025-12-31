'use client';

import React, {
	createContext,
	useContext,
	useCallback,
	useState,
	type ReactNode,
	type RefObject,
} from 'react';
import { useAtom } from 'jotai';
import { sidebarCollapsedAtom, terminalCollapsedAtom } from '@/store';
import { PANEL_CONFIG } from '@/lib/constants';
import type { GroupImperativeHandle } from 'react-resizable-panels';

// ============================================================================
// Types
// ============================================================================

interface PanelControls {
	collapse: () => void;
	expand: () => void;
	toggle: () => void;
	toggleMaximize: () => void;
	setCollapsedState: (collapsed: boolean) => void; // Direct state update (no setLayout)
	isCollapsed: boolean;
	isMaximized: boolean;
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
}

interface PanelProviderProps {
	children: ReactNode;
	horizontalGroupRef: RefObject<GroupImperativeHandle | null>;
	verticalGroupRef: RefObject<GroupImperativeHandle | null>;
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

export function PanelProvider({
	children,
	horizontalGroupRef,
	verticalGroupRef,
}: PanelProviderProps) {
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
		// Set layout to collapsed size (3%)
		horizontalGroupRef.current?.setLayout({ sidebar: 3, main: 97 });
	}, [setSidebarCollapsed, horizontalGroupRef]);

	const expandSidebar = useCallback(() => {
		setSidebarCollapsed(false);
		setSidebarMaximized(false);
		// Set layout to default size (20%)
		horizontalGroupRef.current?.setLayout({ sidebar: 20, main: 80 });
	}, [setSidebarCollapsed, horizontalGroupRef]);

	const toggleSidebar = useCallback(() => {
		if (sidebarCollapsed) {
			expandSidebar();
		} else {
			collapseSidebar();
		}
	}, [sidebarCollapsed, collapseSidebar, expandSidebar]);

	const toggleMaximizeSidebar = useCallback(() => {
		if (sidebarMaximized) {
			// Restore to default
			setSidebarMaximized(false);
			horizontalGroupRef.current?.setLayout({ sidebar: 20, main: 80 });
		} else {
			// Maximize sidebar
			setSidebarMaximized(true);
			setSidebarCollapsed(false);
			const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
			horizontalGroupRef.current?.setLayout({ sidebar: maxSize, main: 100 - maxSize });
		}
	}, [sidebarMaximized, setSidebarCollapsed, horizontalGroupRef]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
		// Set layout to collapsed size (3%)
		verticalGroupRef.current?.setLayout({ content: 97, terminal: 3 });
	}, [setTerminalCollapsed, verticalGroupRef]);

	const expandTerminal = useCallback(() => {
		setTerminalCollapsed(false);
		setTerminalMaximized(false);
		// Set layout to default size (40%)
		verticalGroupRef.current?.setLayout({ content: 60, terminal: 40 });
	}, [setTerminalCollapsed, verticalGroupRef]);

	const toggleTerminal = useCallback(() => {
		if (terminalCollapsed) {
			expandTerminal();
		} else {
			collapseTerminal();
		}
	}, [terminalCollapsed, collapseTerminal, expandTerminal]);

	const toggleMaximizeTerminal = useCallback(() => {
		if (terminalMaximized) {
			// Restore to default
			setTerminalMaximized(false);
			verticalGroupRef.current?.setLayout({ content: 60, terminal: 40 });
		} else {
			// Maximize terminal
			setTerminalMaximized(true);
			setTerminalCollapsed(false);
			const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
			verticalGroupRef.current?.setLayout({ content: 100 - maxSize, terminal: maxSize });
		}
	}, [terminalMaximized, setTerminalCollapsed, verticalGroupRef]);

	// ========================================================================
	// Context Value
	// ========================================================================

	const value: PanelContextValue = {
		sidebar: {
			collapse: collapseSidebar,
			expand: expandSidebar,
			toggle: toggleSidebar,
			toggleMaximize: toggleMaximizeSidebar,
			setCollapsedState: setSidebarCollapsed, // Direct state update (no setLayout)
			isCollapsed: sidebarCollapsed,
			isMaximized: sidebarMaximized,
		},
		terminal: {
			collapse: collapseTerminal,
			expand: expandTerminal,
			toggle: toggleTerminal,
			toggleMaximize: toggleMaximizeTerminal,
			setCollapsedState: setTerminalCollapsed, // Direct state update (no setLayout)
			isCollapsed: terminalCollapsed,
			isMaximized: terminalMaximized,
		},
	};

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
