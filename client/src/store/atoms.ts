import { atom } from 'jotai';
import { WindowState } from '@/types/window';

export const bootCompleteAtom = atom(false);

export const windowsAtom = atom<WindowState[]>([]);
export const activeWindowIdAtom = atom<string | null>(null);

// Derived atom to get the order of windows for z-index management
export const windowStackAtom = atom<string[]>([]);
