/**
 * src/store/index.ts
 * Global Jotai atom store.
 */

import { atom } from 'jotai';

// System state
export const bootCompleteAtom = atom(false);
export const folderExpansionSignalAtom = atom(0);

// UI state
export const mobileSidebarOpenAtom = atom(false);
