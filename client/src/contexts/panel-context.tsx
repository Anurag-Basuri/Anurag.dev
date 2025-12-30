'use client';

import React, {
	createContext,
	useContext,
	useCallback,
	useRef,
	useState,
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
import type { GroupImperativeHandle } from 'react-resizable-panels';

// ============================================================================
// Types
// ============================================================================

interface PanelControls {
	collapse: () => void;
	expand: () => void;
	maximize: () => void;
	restore: () => void;
	toggle: () => void;
	toggleMaximize: () => void;
	isCollapsed: boolean;
	isMaximized: boolean;
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
	horizontalGroupRef: React.RefObject<GroupImperativeHandle | null>;
	verticalGroupRef: React.RefObject<GroupImperativeHandle | null>;
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

interface PanelProviderProps {
	children: ReactNode;
}

export function PanelProvider({ children }: PanelProviderProps) {
	// Atoms for collapsed state
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);
	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	// Maximized state tracking
	const [sidebarMaximized, setSidebarMaximized] = useState(false);
	const [terminalMaximized, setTerminalMaximized] = useState(false);

	// Store pre-maximize sizes for restore
	const preSidebarMaxSize = useRef<number | null>(null);
	const preTerminalMaxSize = useRef<number | null>(null);
	const preTerminalCollapsed = useRef<boolean>(false);
	const preSidebarCollapsed = useRef<boolean>(false);

	// Refs for layout control
	const horizontalGroupRef = useRef<GroupImperativeHandle | null>(null);
	const verticalGroupRef = useRef<GroupImperativeHandle | null>(null);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		setSidebarCollapsed(true);
		setSidebarMaximized(false);
		// Use collapsedSize (3%) for proper animation
		horizontalGroupRef.current?.setLayout({ sidebar: 3, main: 97 });
	}, [setSidebarCollapsed]);

	const expandSidebar = useCallback(() => {
		setSidebarCollapsed(false);
		setSidebarMaximized(false);
		const defaultSize = hSizes?.[0] ?? 20;
		horizontalGroupRef.current?.setLayout({
			sidebar: defaultSize,
			main: 100 - defaultSize,
		});
	}, [setSidebarCollapsed, hSizes]);

	const maximizeSidebar = useCallback(() => {
		// Store current state for restore
		preSidebarMaxSize.current = hSizes?.[0] ?? 20;

		// Expand sidebar to max
		setSidebarCollapsed(false);
		setSidebarMaximized(true);
		const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
		horizontalGroupRef.current?.setLayout({
			sidebar: maxSize,
			main: 100 - maxSize,
		});
	}, [setSidebarCollapsed, setTerminalCollapsed, hSizes, terminalCollapsed]);

	const restoreSidebar = useCallback(() => {
		setSidebarMaximized(false);

		// Restore sidebar to previous size
		const prevSize = preSidebarMaxSize.current ?? hSizes?.[0] ?? 20;
		horizontalGroupRef.current?.setLayout({
			sidebar: prevSize,
			main: 100 - prevSize,
		});
	}, [hSizes]);

	const toggleSidebar = useCallback(() => {
		if (sidebarCollapsed) {
			expandSidebar();
		} else {
			collapseSidebar();
		}
	}, [sidebarCollapsed, collapseSidebar, expandSidebar]);

	const toggleMaximizeSidebar = useCallback(() => {
		if (sidebarMaximized) {
			restoreSidebar();
		} else {
			maximizeSidebar();
		}
	}, [sidebarMaximized, maximizeSidebar, restoreSidebar]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
		// Use collapsedSize (3%) for proper animation
		verticalGroupRef.current?.setLayout({ content: 97, terminal: 3 });
	}, [setTerminalCollapsed]);

	const expandTerminal = useCallback(() => {
		setTerminalCollapsed(false);
		setTerminalMaximized(false);
		const defaultSize = vSizes?.[1] ?? 40;
		verticalGroupRef.current?.setLayout({
			content: 100 - defaultSize,
			terminal: defaultSize,
		});
	}, [setTerminalCollapsed, vSizes]);

	const maximizeTerminal = useCallback(() => {
		// Store current state for restore
		preTerminalMaxSize.current = vSizes?.[1] ?? 40;

		// Expand terminal to max
		setTerminalCollapsed(false);
		setTerminalMaximized(true);
		const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
		verticalGroupRef.current?.setLayout({
			content: 100 - maxSize,
			terminal: maxSize,
		});
	}, [setSidebarCollapsed, setTerminalCollapsed, vSizes, sidebarCollapsed]);

	const restoreTerminal = useCallback(() => {
		setTerminalMaximized(false);

		// Restore terminal to previous size
		const prevSize = preTerminalMaxSize.current ?? vSizes?.[1] ?? 40;
		verticalGroupRef.current?.setLayout({
			content: 100 - prevSize,
			terminal: prevSize,
		});
	}, [vSizes]);

	const toggleTerminal = useCallback(() => {
		if (terminalCollapsed) {
			expandTerminal();
		} else {
			collapseTerminal();
		}
	}, [terminalCollapsed, collapseTerminal, expandTerminal]);

	const toggleMaximizeTerminal = useCallback(() => {
		if (terminalMaximized) {
			restoreTerminal();
		} else {
			maximizeTerminal();
		}
	}, [terminalMaximized, maximizeTerminal, restoreTerminal]);

	// ========================================================================
	// Context Value
	// ========================================================================

	const value: PanelContextValue = {
		sidebar: {
			collapse: collapseSidebar,
			expand: expandSidebar,
			maximize: maximizeSidebar,
			restore: restoreSidebar,
			toggle: toggleSidebar,
			toggleMaximize: toggleMaximizeSidebar,
			isCollapsed: sidebarCollapsed,
			isMaximized: sidebarMaximized,
		},
		terminal: {
			collapse: collapseTerminal,
			expand: expandTerminal,
			maximize: maximizeTerminal,
			restore: restoreTerminal,
			toggle: toggleTerminal,
			toggleMaximize: toggleMaximizeTerminal,
			isCollapsed: terminalCollapsed,
			isMaximized: terminalMaximized,
		},
		horizontalGroupRef,
		verticalGroupRef,
	};

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
