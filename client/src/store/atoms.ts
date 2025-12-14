import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Storage<T> = {
	getItem: (key: string) => T;
	setItem: (key: string, value: T) => void;
	removeItem: (key: string) => void;
};
import { getModuleComponent } from '@/lib/moduleRegistry';
import { WindowState } from '@/types/window';

export const bootCompleteAtom = atom(false);

// Consolidated layout state
export interface LayoutState {
	sidebar: {
		collapsed: boolean;
		size: number;
	};
	terminal: {
		collapsed: boolean;
		size: number;
	};
	main: {
		vertical: number[];
		horizontal: number[];
	};
}

export const defaultLayoutState: LayoutState = {
	sidebar: { collapsed: false, size: 20 },
	terminal: { collapsed: false, size: 25 },
	main: {
		vertical: [75, 25],
		horizontal: [20, 80],
	},
};

export const layoutStateAtom = atomWithStorage<LayoutState>('layout:state', defaultLayoutState);

type PersistedWindowState = Omit<WindowState, 'component'>;

const windowsStorage: Storage<WindowState[]> = {
	getItem: key => {
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

// Persist window state without storing React nodes
export const windowsAtom = atomWithStorage<WindowState[]>('windows', [], windowsStorage);
export const windowStackAtom = atomWithStorage<string[]>('window-stack', []);
export const mainVerticalSizesAtom = atomWithStorage<number[]>('layout:main-v', [60, 40]);
export const mainHorizontalSizesAtom = atomWithStorage<number[]>('layout:main-h', [20, 80]);
export const sidebarCollapsedAtom = atomWithStorage('layout:sidebar-collapsed', false);
export const terminalCollapsedAtom = atomWithStorage('layout:terminal-collapsed', false);

export const activeWindowIdAtom = atom<string | null>(null);
export const mobileSidebarOpenAtom = atom(false);
