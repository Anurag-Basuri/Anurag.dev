import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface OpenFile {
	moduleId: string;
	openedAt: number;
}

// Constants for default behavior
const DEFAULT_MODULE_ID = 'about' as const;
const STORAGE_KEY = 'open-files' as const;

// Helper function to create a file entry
export const createFileEntry = (moduleId: string): OpenFile => ({
	moduleId,
	openedAt: Date.now(),
});

// Helper function for default initial state
const getDefaultOpenFiles = (): OpenFile[] => [];

/**
 * Atom to track currently open files in the application.
 * Persists to localStorage and initializes empty.
 * Initialized with proper SSR safety.
 */
export const openFilesAtom =
	typeof window !== 'undefined'
		? atomWithStorage<OpenFile[]>(STORAGE_KEY, getDefaultOpenFiles())
		: atom<OpenFile[]>(getDefaultOpenFiles());

// Export constants for use in other modules
export { DEFAULT_MODULE_ID };
