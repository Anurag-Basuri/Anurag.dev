import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store/atoms';
import { getModuleComponent, getModuleTitle } from '@/lib/moduleRegistry';
import { WindowState } from '@/types/window';
import { useCallback } from 'react';

export function useWindowManager() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [, setWindowStack] = useAtom(windowStackAtom);

	const openWindow = useCallback(
		(id: string) => {
			// Use functional updates to prevent stale state issues
			setWindows(prev => {
				const existingWindow = prev.find(w => w.id === id);

				if (existingWindow) {
					// If window exists, show loading state briefly, then bring to front
					const updated = prev.map(w => ({
						...w,
						isMinimized: w.id !== id,
						isLoading: w.id === id ? true : w.isLoading,
					}));

					// Clear loading after transition
					setTimeout(() => {
						setWindows(current =>
							current.map(w => ({
								...w,
								isLoading: false,
							})),
						);
					}, 300);

					setActiveWindowId(id);
					setWindowStack(stack => {
						if (stack.at(-1) !== id) {
							return [...stack.filter(wid => wid !== id), id];
						}
						return stack;
					});

					return updated;
				} else {
					// Add new window with loading state
					const newWindow: WindowState = {
						id,
						title: getModuleTitle(id),
						component: getModuleComponent(id),
						isOpen: true,
						isMinimized: false,
						isMaximized: false,
						isLoading: true,
						position: { x: 0, y: 0 },
						size: { width: 0, height: 0 },
					};

					// Remove loading state after render
					setTimeout(() => {
						setWindows(current =>
							current.map(w => ({
								...w,
								isLoading: false,
							})),
						);
					}, 400);

					setActiveWindowId(id);
					setWindowStack(stack => [...stack, id]);

					// Return new array with minimized existing windows and new window
					return [
						...prev.map(w => ({ ...w, isMinimized: true, isLoading: false })),
						newWindow,
					];
				}
			});
		},
		[setWindows, setActiveWindowId, setWindowStack],
	);

	return { openWindow };
}
