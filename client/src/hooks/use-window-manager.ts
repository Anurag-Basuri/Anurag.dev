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
					isMaximized: true,
					isLoading: false,
					position: { x: 0, y: 0 },
					size: { width: 0, height: 0 },
				};

				return [...prev.map(w => ({ ...w, isMinimized: true })), newWindow];
			});

			bringToFront(id);
		},
		[setWindows, bringToFront],
	);

	const closeWindow = useCallback(
		(id: string) => {
			setWindows(prev => prev.filter(w => w.id !== id));
			setWindowStack(prev => {
				const newStack = prev.filter(wid => wid !== id);
				if (activeWindowId === id) {
					const nextId = newStack.at(-1);
					setActiveWindowId(nextId || null);
				}
				return newStack;
			});
		},
		[setWindows, setWindowStack, activeWindowId, setActiveWindowId],
	);

	const minimizeWindow = useCallback(
		(id: string) => {
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
			if (activeWindowId === id) {
				setWindowStack(prev => {
					const remaining = prev.filter(wid => wid !== id);
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

	const toggleMaximizeWindow = useCallback(
		(id: string) => {
			setWindows(prev =>
				prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
			);
			bringToFront(id);
		},
		[setWindows, bringToFront],
	);

	return { openWindow, closeWindow, minimizeWindow, toggleMaximizeWindow, focusWindow };
}
