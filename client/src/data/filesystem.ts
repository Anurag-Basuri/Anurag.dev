import type { FileSystemItem } from '@/types/file-system';
import { SECTIONS } from '@/lib/sections';

export type { FileSystemItem };

/**
 * Filesystem derived from section registry — flat list, no folders.
 * Each file = one scroll section. Order matches scroll order.
 */
export const INITIAL_FILE_SYSTEM: FileSystemItem[] = SECTIONS.map(section => ({
	name: section.file,
	type: 'file' as const,
	id: section.id,
	moduleId: section.moduleId as FileSystemItem['moduleId'],
	content: section.description,
}));
