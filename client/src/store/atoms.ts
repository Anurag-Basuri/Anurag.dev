import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { WindowState } from '@/types/window';

export const bootCompleteAtom = atom(false);

// Persist window state in localStorage
export const windowsAtom = atomWithStorage<WindowState[]>('windows', []);
export const windowStackAtom = atomWithStorage<string[]>('window-stack', []);

// Atoms for resizable panel sizes
export const verticalSizesAtom = atomWithStorage<number[]>('layout:v', [100, 0]);
export const horizontalSizesAtom = atomWithStorage<number[]>('layout:h', [20, 80]);

export const activeWindowIdAtom = atom<string | null>(null);
