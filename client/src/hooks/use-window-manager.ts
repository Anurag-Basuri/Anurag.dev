import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store/atoms';
import { getModuleComponent, getModuleTitle } from '@/lib/moduleRegistry';
import { WindowState } from '@/types/window';

export function useWindowManager() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const openWindow = (id: string) => {
		const existingWindow = windows.find(w => w.id === id);

		if (existingWindow) {
			// If window exists, bring it to front, un-minimize it, and MINIMIZE all others
			setWindows(
				windows.map(w => ({
					...w,
					isMinimized: w.id !== id, // Only the target window is open
				})),
			);
			setActiveWindowId(id);
			if (windowStack.at(-1) !== id) {
				setWindowStack([...windowStack.filter(wid => wid !== id), id]);
			}
		} else {
			// Add new window and MINIMIZE all existing ones
			const newWindow: WindowState = {
				id,
				title: getModuleTitle(id),
				component: getModuleComponent(id),
				isOpen: true,
				isMinimized: false,
				isMaximized: false, // We force this in WindowFrame anyway
				position: { x: 0, y: 0 },
				size: { width: 0, height: 0 },
			};

			// Update state: Add new window (active) and minimize all previous windows
			setWindows(prev => [...prev.map(w => ({ ...w, isMinimized: true })), newWindow]);
			setActiveWindowId(id);
			setWindowStack(prev => [...prev, id]);
		}
	};

	return { openWindow };
}
