'use client';

import React, { createContext, useContext, useCallback, useRef, type ReactNode } from 'react';
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
	toggle: () => void;
	isCollapsed: boolean;
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
	// Refs for layout control - set by PortfolioLayout
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
	const [hSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes] = useAtom(mainVerticalSizesAtom);

	// Refs for layout control
	const horizontalGroupRef = useRef<GroupImperativeHandle | null>(null);
	const verticalGroupRef = useRef<GroupImperativeHandle | null>(null);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		setSidebarCollapsed(true);
		horizontalGroupRef.current?.setLayout({ sidebar: 0, main: 100 });
	}, [setSidebarCollapsed]);

	const expandSidebar = useCallback(() => {
		setSidebarCollapsed(false);
		const defaultSize = hSizes?.[0] ?? 20;
		horizontalGroupRef.current?.setLayout({
			sidebar: defaultSize,
			main: 100 - defaultSize,
		});
	}, [setSidebarCollapsed, hSizes]);

	const maximizeSidebar = useCallback(() => {
		// Collapse terminal first
		setTerminalCollapsed(true);
		verticalGroupRef.current?.setLayout({ content: 100, terminal: 0 });

		// Expand sidebar to max
		setSidebarCollapsed(false);
		const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
		horizontalGroupRef.current?.setLayout({
			sidebar: maxSize,
			main: 100 - maxSize,
		});
	}, [setSidebarCollapsed, setTerminalCollapsed]);

	const toggleSidebar = useCallback(() => {
		if (sidebarCollapsed) {
			expandSidebar();
		} else {
			collapseSidebar();
		}
	}, [sidebarCollapsed, collapseSidebar, expandSidebar]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		setTerminalCollapsed(true);
		verticalGroupRef.current?.setLayout({ content: 100, terminal: 0 });
	}, [setTerminalCollapsed]);

	const expandTerminal = useCallback(() => {
		setTerminalCollapsed(false);
		const defaultSize = vSizes?.[1] ?? 40;
		verticalGroupRef.current?.setLayout({
			content: 100 - defaultSize,
			terminal: defaultSize,
		});
	}, [setTerminalCollapsed, vSizes]);

	const maximizeTerminal = useCallback(() => {
		// Collapse sidebar first
		setSidebarCollapsed(true);
		horizontalGroupRef.current?.setLayout({ sidebar: 0, main: 100 });

		// Expand terminal to max
		setTerminalCollapsed(false);
		const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
		verticalGroupRef.current?.setLayout({
			content: 100 - maxSize,
			terminal: maxSize,
		});
	}, [setSidebarCollapsed, setTerminalCollapsed]);

	const toggleTerminal = useCallback(() => {
		if (terminalCollapsed) {
			expandTerminal();
		} else {
			collapseTerminal();
		}
	}, [terminalCollapsed, collapseTerminal, expandTerminal]);

	// ========================================================================
	// Context Value
	// ========================================================================

	const value: PanelContextValue = {
		sidebar: {
			collapse: collapseSidebar,
			expand: expandSidebar,
			maximize: maximizeSidebar,
			toggle: toggleSidebar,
			isCollapsed: sidebarCollapsed,
		},
		terminal: {
			collapse: collapseTerminal,
			expand: expandTerminal,
			maximize: maximizeTerminal,
			toggle: toggleTerminal,
			isCollapsed: terminalCollapsed,
		},
		horizontalGroupRef,
		verticalGroupRef,
	};

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
