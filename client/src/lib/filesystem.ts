import type { AppModuleId } from '@/lib/moduleRegistry';
import { SECTIONS } from '@/lib/sections';

export type FileSystemItem = {
	name: string;
	type: 'folder' | 'file';
	children?: FileSystemItem[];
	id: string; // Full path e.g. "root/bio/about"
	icon?: string;
	content?: string;
	moduleId?: AppModuleId; // Strictly typed to registry keys
	metadata?: Record<string, unknown>;
};

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = SECTIONS.map(section => ({
	name: section.file,
	type: 'file' as const,
	id: section.id,
	moduleId: section.moduleId as FileSystemItem['moduleId'],
	content: section.description,
}));

