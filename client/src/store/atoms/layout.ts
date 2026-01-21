import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import { LayoutState } from '@/types/layout';

import { DEFAULT_LAYOUT, LAYOUT_STORAGE_KEYS } from '@/lib/constants';

export const defaultLayoutState: LayoutState = DEFAULT_LAYOUT;

export const layoutStateAtom = atomWithStorage<LayoutState>(
	LAYOUT_STORAGE_KEYS.state,
	defaultLayoutState,
);

// Module state (not managed by resizable panels)
export const moduleMaximizedAtom = atom(false);
export const moduleMinimizedAtom = atom(false);
export const mobileSidebarOpenAtom = atom(false);
