import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store';
import { getModuleComponent, getModuleTitle } from '@/lib/moduleRegistry';
import { WindowState } from '@/types/window';
import { useCallback } from 'react';

export function useWindowManager() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom<string | null, [string | null], void>(
		activeWindowIdAtom,
	);
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
					isMaximized: false,
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

			// Update stack
			setWindowStack(prev => prev.filter(wid => wid !== id));

			if (activeWindowId === id) {
				// Find next candidate
				const candidateId = [...windowStack]
					.reverse()
					.find(wid => wid !== id && !windows.find(w => w.id === wid)?.isMinimized);

				setActiveWindowId(candidateId || null);
			}
		},
		[setWindows, setWindowStack, activeWindowId, setActiveWindowId, windows, windowStack],
	);

	const minimizeWindow = useCallback(
		(id: string) => {
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));

			if (activeWindowId === id) {
				// Find next candidate that is NOT minimized
				// We need to look at the current 'windows' state, but assuming the one we just minimized is now excluded
				const candidateId = [...windowStack]
					.reverse()
					.find(wid => wid !== id && !windows.find(w => w.id === wid)?.isMinimized);

				setActiveWindowId(candidateId || null);
			}
		},
		[setWindows, activeWindowId, setActiveWindowId, windowStack, windows],
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
			setWindows(prev => {
				const targetWindow = prev.find(w => w.id === id);
				if (!targetWindow) return prev;

				const isMaximized = !targetWindow.isMaximized;

				return prev.map(w => {
					if (w.id === id) {
						return { ...w, isMaximized };
					}
					// If we are maximizing this window, un-maximize all others to ensure exclusive fullscreen
					if (isMaximized) {
						return { ...w, isMaximized: false };
					}
					return w;
				});
			});
			bringToFront(id);
		},
		[setWindows, bringToFront],
	);

	return { openWindow, closeWindow, minimizeWindow, toggleMaximizeWindow, focusWindow };
}
