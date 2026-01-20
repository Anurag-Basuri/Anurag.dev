'use client';

import {
	createContext,
	useContext,
	useCallback,
	useMemo,
	useState,
	useEffect,
	useRef,
	type ReactNode,
	type Dispatch,
	type SetStateAction,
} from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
	mainHorizontalSizesAtom,
	mainVerticalSizesAtom,
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
} from '@/store';
import { PANEL_CONFIG } from '@/lib/constants';
import { usePanelCallbackRef, type PanelImperativeHandle } from 'react-resizable-panels';

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
	setSidebarCollapsedState: (collapsed: boolean) => void;
	setTerminalCollapsedState: (collapsed: boolean) => void;
	setSidebarPanelRef: Dispatch<SetStateAction<PanelImperativeHandle | null>>;
	setTerminalPanelRef: Dispatch<SetStateAction<PanelImperativeHandle | null>>;
	persistHorizontalSizes: (sizes: number[]) => void;
	persistVerticalSizes: (sizes: number[]) => void;
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
	const [sidebarPanel, setSidebarPanelRef] = usePanelCallbackRef();
	const [terminalPanel, setTerminalPanelRef] = usePanelCallbackRef();

	// Collapsed state from Jotai (persisted to localStorage)
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);

	// Maximized state (local, not persisted)
	const [sidebarMaximized, setSidebarMaximized] = useState(false);
	const [terminalMaximized, setTerminalMaximized] = useState(false);

	// Size atoms for persistence
	const [hSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes] = useAtom(mainVerticalSizesAtom);
	const setHSizes = useSetAtom(mainHorizontalSizesAtom);
	const setVSizes = useSetAtom(mainVerticalSizesAtom);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		sidebarPanel?.collapse();
		setSidebarCollapsed(true);
		setSidebarMaximized(false);
	}, [sidebarPanel, setSidebarCollapsed]);

	const expandSidebar = useCallback(() => {
		const restoreSize = hSizes?.[0] ?? parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize);
		if (sidebarPanel?.isCollapsed()) {
			sidebarPanel.expand();
		}
		sidebarPanel?.resize(restoreSize);
		setSidebarCollapsed(false);
		setSidebarMaximized(false);
	}, [sidebarPanel, setSidebarCollapsed, hSizes]);

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
			const restoreSize =
				hSizes?.[0] ?? parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize);
			sidebarPanel?.resize(restoreSize);
		} else {
			setSidebarMaximized(true);
			setSidebarCollapsed(false);
			if (sidebarPanel?.isCollapsed()) {
				sidebarPanel.expand();
			}
			sidebarPanel?.resize(parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize));
		}
	}, [sidebarMaximized, sidebarPanel, hSizes, setSidebarCollapsed]);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		terminalPanel?.collapse();
		setTerminalCollapsed(true);
		setTerminalMaximized(false);
	}, [terminalPanel, setTerminalCollapsed]);

	const expandTerminal = useCallback(() => {
		const restoreSize = vSizes?.[1] ?? parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize);
		if (terminalPanel?.isCollapsed()) {
			terminalPanel.expand();
		}
		terminalPanel?.resize(restoreSize);
		setTerminalCollapsed(false);
		setTerminalMaximized(false);
	}, [terminalPanel, setTerminalCollapsed, vSizes]);

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
			const restoreSize =
				vSizes?.[1] ?? parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize);
			terminalPanel?.resize(restoreSize);
		} else {
			setTerminalMaximized(true);
			setTerminalCollapsed(false);
			if (terminalPanel?.isCollapsed()) {
				terminalPanel.expand();
			}
			terminalPanel?.resize(parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize));
		}
	}, [terminalMaximized, terminalPanel, vSizes, setTerminalCollapsed]);

	// ========================================================================
	// Size Persistence
	// ========================================================================

	const persistHorizontalSizes = useCallback(
		(sizes: number[]) => {
			if (sizes.length === 2 && sizes[0] > 5) {
				setHSizes(sizes);
			}
		},
		[setHSizes],
	);

	const persistVerticalSizes = useCallback(
		(sizes: number[]) => {
			if (sizes.length === 2 && sizes[1] > 5) {
				setVSizes(sizes);
			}
		},
		[setVSizes],
	);

	const setSidebarCollapsedState = useCallback(
		(collapsed: boolean) => {
			setSidebarCollapsed(collapsed);
			if (collapsed) setSidebarMaximized(false);
		},
		[setSidebarCollapsed],
	);

	const setTerminalCollapsedState = useCallback(
		(collapsed: boolean) => {
			setTerminalCollapsed(collapsed);
			if (collapsed) setTerminalMaximized(false);
		},
		[setTerminalCollapsed],
	);

	// ========================================================================
	// One-time sync Jotai state → Library state (initial mount only)
	// ========================================================================

	const sidebarInitializedRef = useRef(false);
	const terminalInitializedRef = useRef(false);

	useEffect(() => {
		if (!sidebarPanel || sidebarInitializedRef.current) return;
		sidebarInitializedRef.current = true;
		if (sidebarCollapsed) {
			sidebarPanel.collapse();
			return;
		}
		const restoreSize =
			hSizes?.[0] ?? parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize);
		sidebarPanel.expand();
		sidebarPanel.resize(restoreSize);
	}, [sidebarPanel, sidebarCollapsed, hSizes]);

	useEffect(() => {
		if (!terminalPanel || terminalInitializedRef.current) return;
		terminalInitializedRef.current = true;
		if (terminalCollapsed) {
			terminalPanel.collapse();
			return;
		}
		const restoreSize =
			vSizes?.[1] ?? parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize);
		terminalPanel.expand();
		terminalPanel.resize(restoreSize);
	}, [terminalPanel, terminalCollapsed, vSizes]);

	// ========================================================================
	// Context Value
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
			setSidebarCollapsedState,
			setTerminalCollapsedState,
			setSidebarPanelRef,
			setTerminalPanelRef,
			persistHorizontalSizes,
			persistVerticalSizes,
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
			setSidebarCollapsedState,
			setTerminalCollapsedState,
			setSidebarPanelRef,
			setTerminalPanelRef,
			persistHorizontalSizes,
			persistVerticalSizes,
		],
	);

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
