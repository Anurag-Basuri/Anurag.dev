'use client';

import {
	createContext,
	useContext,
	useCallback,
	useState,
	type ReactNode,
	type Dispatch,
	type SetStateAction,
} from 'react';
import { usePanelCallbackRef, type PanelImperativeHandle } from 'react-resizable-panels';

// ============================================================================
// Types
// ============================================================================

interface PanelControls {
	collapse: () => void;
	expand: () => void;
	toggle: () => void;
	setCollapsed: (collapsed: boolean) => void;
	isCollapsed: boolean;
}

interface PanelContextValue {
	sidebar: PanelControls;
	terminal: PanelControls;
	setSidebarPanelRef: Dispatch<SetStateAction<PanelImperativeHandle | null>>;
	setTerminalPanelRef: Dispatch<SetStateAction<PanelImperativeHandle | null>>;
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
	// Panel refs from library - THE SINGLE SOURCE OF TRUTH
	const [sidebarPanel, setSidebarPanelRef] = usePanelCallbackRef();
	const [terminalPanel, setTerminalPanelRef] = usePanelCallbackRef();

	// Local state to trigger re-renders when collapsed state changes
	// This is derived from library state, not the source of truth
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [terminalCollapsed, setTerminalCollapsed] = useState(false);

	// ========================================================================
	// Sidebar Controls
	// ========================================================================

	const collapseSidebar = useCallback(() => {
		sidebarPanel?.collapse();
		setSidebarCollapsed(true);
	}, [sidebarPanel]);

	const expandSidebar = useCallback(() => {
		sidebarPanel?.expand();
		setSidebarCollapsed(false);
	}, [sidebarPanel]);

	const toggleSidebar = useCallback(() => {
		if (sidebarPanel?.isCollapsed()) {
			sidebarPanel.expand();
			setSidebarCollapsed(false);
		} else {
			sidebarPanel?.collapse();
			setSidebarCollapsed(true);
		}
	}, [sidebarPanel]);

	const setSidebarCollapsedState = useCallback((collapsed: boolean) => {
		setSidebarCollapsed(prev => (prev === collapsed ? prev : collapsed));
	}, []);

	// ========================================================================
	// Terminal Controls
	// ========================================================================

	const collapseTerminal = useCallback(() => {
		terminalPanel?.collapse();
		setTerminalCollapsed(true);
	}, [terminalPanel]);

	const expandTerminal = useCallback(() => {
		terminalPanel?.expand();
		setTerminalCollapsed(false);
	}, [terminalPanel]);

	const toggleTerminal = useCallback(() => {
		if (terminalPanel?.isCollapsed()) {
			terminalPanel.expand();
			setTerminalCollapsed(false);
		} else {
			terminalPanel?.collapse();
			setTerminalCollapsed(true);
		}
	}, [terminalPanel]);

	const setTerminalCollapsedState = useCallback((collapsed: boolean) => {
		setTerminalCollapsed(prev => (prev === collapsed ? prev : collapsed));
	}, []);

	// ========================================================================
	// Context Value
	// ========================================================================

	return (
		<PanelContext.Provider
			value={{
				sidebar: {
					collapse: collapseSidebar,
					expand: expandSidebar,
					toggle: toggleSidebar,
					setCollapsed: setSidebarCollapsedState,
					isCollapsed: sidebarCollapsed,
				},
				terminal: {
					collapse: collapseTerminal,
					expand: expandTerminal,
					toggle: toggleTerminal,
					setCollapsed: setTerminalCollapsedState,
					isCollapsed: terminalCollapsed,
				},
				setSidebarPanelRef,
				setTerminalPanelRef,
			}}
		>
			{children}
		</PanelContext.Provider>
	);
}
