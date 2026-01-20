import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import { LayoutState } from '@/types/layout';

import { DEFAULT_LAYOUT, LAYOUT_STORAGE_KEYS } from '@/lib/constants';

export const defaultLayoutState: LayoutState = DEFAULT_LAYOUT;

export const layoutStateAtom = atomWithStorage<LayoutState>(
	LAYOUT_STORAGE_KEYS.state,
	defaultLayoutState,
);

// Panel sizes for localStorage persistence
export const mainVerticalSizesAtom = atomWithStorage<number[]>('layout:main-v', [60, 40]);
export const mainHorizontalSizesAtom = atomWithStorage<number[]>('layout:main-h', [20, 80]);

// Panel collapsed state (persisted to localStorage)
export const sidebarCollapsedAtom = atomWithStorage<boolean>('layout:sidebar-collapsed', false);
export const terminalCollapsedAtom = atomWithStorage<boolean>('layout:terminal-collapsed', false);

// Module state (not managed by resizable panels)
export const moduleMaximizedAtom = atom(false);
export const moduleMinimizedAtom = atom(false);
export const mobileSidebarOpenAtom = atom(false);
