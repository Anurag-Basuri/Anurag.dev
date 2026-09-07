import { atom } from 'jotai';

// Controls boot screen visibility. Starts as false so BootGuard shows the intro.
export const bootCompleteAtom = atom(false);
export const windowStateAtom = atom<'open' | 'minimized' | 'closed'>('open');
