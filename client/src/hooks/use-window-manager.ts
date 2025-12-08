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
			// If window exists, bring it to front and un-minimize
			setWindows(windows.map(w => (w.id === id ? { ...w, isMinimized: false } : w)));
			setActiveWindowId(id);
			if (windowStack.at(-1) !== id) {
				setWindowStack([...windowStack.filter(wid => wid !== id), id]);
			}
		} else {
			// Add new window
			const newWindow: WindowState = {
				id,
				title: getModuleTitle(id),
				component: getModuleComponent(id),
				isOpen: true,
				isMinimized: false,
				isMaximized: false,
				position: {
					x: 150 + windows.length * 20,
					y: 100 + windows.length * 20,
				},
				size: { width: 720, height: 480 },
			};
			setWindows(prev => [...prev, newWindow]);
			setActiveWindowId(id);
			setWindowStack(prev => [...prev, id]);
		}
	};

	return { openWindow };
}
