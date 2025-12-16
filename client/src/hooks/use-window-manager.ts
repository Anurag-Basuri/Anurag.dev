import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store';
import { getModuleComponent, getModuleTitle } from '@/lib/moduleRegistry';
import { WindowState } from '@/types/window';
import { useCallback } from 'react';

export function useWindowManager() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	// Helper to handle z-index stack
	const bringToFront = useCallback(
		(id: string) => {
			setWindowStack(prev => {
				if (prev.at(-1) === id) return prev;
				return [...prev.filter(wid => wid !== id), id];
			});
			setActiveWindowId(id);
		},
		[setWindowStack, setActiveWindowId],
	);

	const openWindow = useCallback(
		(id: string) => {
			setWindows(prev => {
				const existingWindow = prev.find(w => w.id === id);

				if (existingWindow) {
					// Check if it's minimized, if so, restore it
					if (existingWindow.isMinimized) {
						// Bring to front handled below
					}
					return prev.map(w =>
						w.id === id
							? { ...w, isMinimized: false }
							: { ...w, isMinimized: w.id !== id },
					);
				}

				// Create new window
				const newWindow: WindowState = {
					id,
					title: getModuleTitle(id),
					component: getModuleComponent(id),
					isOpen: true,
					isMinimized: false,
					isMaximized: true, // Always maximized now
					isLoading: false, // Removed artificial delay
					position: { x: 0, y: 0 }, // Not relevant for fullscreen but kept for type
					size: { width: 0, height: 0 },
				};

				// Minimize others to focus on new one (optional UX choice, keeps view clean)
				return [...prev.map(w => ({ ...w, isMinimized: true })), newWindow];
			});

			// Ensure stack updates after state change
			bringToFront(id);
		},
		[setWindows, bringToFront],
	);

	const closeWindow = useCallback(
		(id: string) => {
			setWindows(prev => prev.filter(w => w.id !== id));
			setWindowStack(prev => {
				const newStack = prev.filter(wid => wid !== id);
				// Focus the next available window if the active one was closed
				if (activeWindowId === id) {
					const nextId = newStack.at(-1);
					setActiveWindowId(nextId || null);
					// If we are restoring another window, ensure it's unminimized?
					// For now, let's just update focus. The user might need to click taskbar to unminimize.
					// Or better: auto-restore the last window?
					// Let's stick to standard behavior: just close.
				}
				return newStack;
			});
		},
		[setWindows, setWindowStack, activeWindowId, setActiveWindowId],
	);

	const minimizeWindow = useCallback(
		(id: string) => {
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
			// If active window is minimized, focus falls to underlying or none
			if (activeWindowId === id) {
				setWindowStack(prev => {
					// Don't remove from stack, just change active ID
					const remaining = prev.filter(wid => wid !== id);
					// Actually we keep it in stack to know z-index order, just inactive
					setActiveWindowId(remaining.at(-1) || null);
					return prev;
				});
			}
		},
		[setWindows, activeWindowId, setActiveWindowId, setWindowStack],
	);

	const focusWindow = useCallback(
		(id: string) => {
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: false } : w)));
			bringToFront(id);
		},
		[setWindows, bringToFront],
	);

	return { openWindow, closeWindow, minimizeWindow, focusWindow };
}
