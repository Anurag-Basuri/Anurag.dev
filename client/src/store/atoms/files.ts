import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface OpenFile {
	moduleId: string;
	openedAt: number;
}

// Initialize with 'about' as the default file
export const openFilesAtom = atomWithStorage<OpenFile[]>('open-files', [
	{ moduleId: 'about', openedAt: Date.now() },
]);
