import { atomWithStorage } from 'jotai/utils';
import { atom, PrimitiveAtom } from 'jotai';
import { WindowState } from '@/types/window';
import { getModuleComponent } from '@/lib/moduleRegistry';

const windowsStorage = {
	getItem: (key: string): WindowState[] => {
		if (typeof window === 'undefined') return [];
		const raw = window.localStorage.getItem(key);
		if (!raw) return [];
		try {
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return [];
			return parsed
				.filter(win => win && typeof win.id === 'string')
				.map(win => ({
					...win,
					title: win.title || win.id.toUpperCase(),
					isOpen: win.isOpen ?? true,
					isMinimized: win.isMinimized ?? false,
					isMaximized: win.isMaximized ?? false,
					component: getModuleComponent(win.id),
				}));
		} catch (err) {
			console.warn('Failed to parse window state; resetting.', err);
			window.localStorage.removeItem(key);
			return [];
		}
	},
	setItem: (key: string, value: WindowState[]): void => {
		if (typeof window === 'undefined') return;
		try {
			const serializable = value.map((win: WindowState) => {
				const { component, ...rest } = win;
				return rest;
			});
			window.localStorage.setItem(key, JSON.stringify(serializable));
		} catch (err) {
			console.warn('Failed to persist window state', err);
		}
	},
	removeItem: (key: string): void => {
		if (typeof window === 'undefined') return;
		window.localStorage.removeItem(key);
	},
};

export const windowsAtom = atomWithStorage<WindowState[]>('windows', [], windowsStorage);
export const windowStackAtom = atomWithStorage<string[]>('window-stack', []);
export const activeWindowIdAtom: PrimitiveAtom<string | null> = atom<string | null>(null);
