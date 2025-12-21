import type { AppModuleId } from '@/lib/moduleRegistry';

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
