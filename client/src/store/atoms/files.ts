import { atom } from 'jotai';

export interface OpenFile {
	moduleId: string;
	openedAt: number;
}

export const openFilesAtom = atom<OpenFile[]>([]);
