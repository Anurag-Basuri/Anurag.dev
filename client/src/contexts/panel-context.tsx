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
import { mainHorizontalSizesAtom, mainVerticalSizesAtom } from '@/store';
import { PANEL_CONFIG } from '@/lib/constants';
import { usePanelCallbackRef, type PanelImperativeHandle } from 'react-resizable-panels';

// Interface for individual panel controls
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
	setSidebarPanelRef: React.Dispatch<React.SetStateAction<PanelImperativeHandle | null>>;
	setTerminalPanelRef: React.Dispatch<React.SetStateAction<PanelImperativeHandle | null>>;
	persistHorizontalSizes: (sizes: number[]) => void;
	persistVerticalSizes: (sizes: number[]) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

// Hook to use the PanelContext
export function usePanelControls() {
	const context = useContext(PanelContext);
	if (!context) {
		throw new Error('usePanelControls must be used within a PanelProvider');
	}
	return context;
}

// PanelProvider component
export function PanelProvider({ children }: { children: ReactNode }) {
	// Panel refs from library - these are the single source of truth for collapsed state
	const [sidebarPanel, setSidebarPanelRef] = usePanelCallbackRef();
	const [terminalPanel, setTerminalPanelRef] = usePanelCallbackRef();

	// Persisted sizes for restore (Jotai only for localStorage, not active state)
	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	// Local maximized state (not persisted)
	const [sidebarMaximized, setSidebarMaximized] = useState(false);
	const [terminalMaximized, setTerminalMaximized] = useState(false);

	// Trigger re-renders when collapsed state changes
	const [, forceUpdate] = useState(0);
	const triggerUpdate = useCallback(() => forceUpdate(n => n + 1), []);

	// Derive collapsed state from library panel refs
	const sidebarCollapsed = sidebarPanel?.isCollapsed() ?? false;
	const terminalCollapsed = terminalPanel?.isCollapsed() ?? false;

	// Sidebar Controls
	const collapseSidebar = useCallback(() => {
		sidebarPanel?.collapse();
		setSidebarMaximized(false);
		triggerUpdate();
	}, [sidebarPanel, triggerUpdate]);

	const expandSidebar = useCallback(() => {
		sidebarPanel?.expand();
		setSidebarMaximized(false);
		triggerUpdate();
	}, [sidebarPanel, triggerUpdate]);

	const toggleSidebar = useCallback(() => {
		if (sidebarPanel?.isCollapsed()) {
			sidebarPanel.expand();
		} else {
			sidebarPanel?.collapse();
		}
		setSidebarMaximized(false);
		triggerUpdate();
	}, [sidebarPanel, triggerUpdate]);

	const toggleMaximizeSidebar = useCallback(() => {
		if (sidebarMaximized) {
			setSidebarMaximized(false);
			// Restore to persisted size
			const restoreSize =
				hSizes?.[0] ?? parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize);
			sidebarPanel?.resize(restoreSize);
		} else {
			setSidebarMaximized(true);
			if (sidebarPanel?.isCollapsed()) {
				sidebarPanel.expand();
			}
			const maxSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize);
			sidebarPanel?.resize(maxSize);
		}
		triggerUpdate();
	}, [sidebarMaximized, sidebarPanel, hSizes, triggerUpdate]);

	// Terminal Controls
	const collapseTerminal = useCallback(() => {
		terminalPanel?.collapse();
		setTerminalMaximized(false);
		triggerUpdate();
	}, [terminalPanel, triggerUpdate]);

	const expandTerminal = useCallback(() => {
		terminalPanel?.expand();
		setTerminalMaximized(false);
		triggerUpdate();
	}, [terminalPanel, triggerUpdate]);

	const toggleTerminal = useCallback(() => {
		if (terminalPanel?.isCollapsed()) {
			terminalPanel.expand();
		} else {
			terminalPanel?.collapse();
		}
		setTerminalMaximized(false);
		triggerUpdate();
	}, [terminalPanel, triggerUpdate]);

	const toggleMaximizeTerminal = useCallback(() => {
		if (terminalMaximized) {
			setTerminalMaximized(false);
			// Restore to persisted size
			const restoreSize =
				vSizes?.[1] ?? parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize);
			terminalPanel?.resize(restoreSize);
		} else {
			setTerminalMaximized(true);
			if (terminalPanel?.isCollapsed()) {
				terminalPanel.expand();
			}
			const maxSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize);
			terminalPanel?.resize(maxSize);
		}
		triggerUpdate();
	}, [terminalMaximized, terminalPanel, vSizes, triggerUpdate]);

	// Size persistence (called by DesktopLayout on resize end)
	const persistHorizontalSizes = useCallback(
		(sizes: number[]) => {
			// Only persist if sidebar is not collapsed (don't save collapsed size)
			if (!sidebarPanel?.isCollapsed() && sizes[0] > 5) {
				setHSizes(sizes);
			}
		},
		[sidebarPanel, setHSizes],
	);

	const persistVerticalSizes = useCallback(
		(sizes: number[]) => {
			// Only persist if terminal is not collapsed (don't save collapsed size)
			if (!terminalPanel?.isCollapsed() && sizes[1] > 5) {
				setVSizes(sizes);
			}
		},
		[terminalPanel, setVSizes],
	);

	// Context Value - memoized to prevent unnecessary re-renders
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
			setSidebarPanelRef,
			setTerminalPanelRef,
			persistHorizontalSizes,
			persistVerticalSizes,
		],
	);

	return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}
