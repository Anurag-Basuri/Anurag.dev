'use client';

import React from 'react';
import {
	FileText,
	Image as ImageIcon,
	Music,
	Video,
	Code,
	FileJson,
	FileBox,
	Terminal,
	Folder,
	FolderOpen,
	File,
	type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileIconProps {
	name: string;
	isDirectory?: boolean;
	isOpen?: boolean;
	className?: string;
}

const getIconForFile = (name: string): LucideIcon => {
	const ext = name.split('.').pop()?.toLowerCase();

	switch (ext) {
		case 'ts':
		case 'tsx':
		case 'js':
		case 'jsx':
			return Code;
		case 'json':
			return FileJson;
		case 'md':
		case 'txt':
			return FileText;
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'svg':
			return ImageIcon;
		case 'mp3':
		case 'wav':
			return Music;
		case 'mp4':
		case 'mov':
			return Video;
		case 'sh':
		case 'bat':
		case 'cmd':
			return Terminal;
		default:
			return File;
	}
};

export function FileIcon({ name, isDirectory, isOpen, className }: FileIconProps) {
	if (isDirectory) {
		const Icon = isOpen ? FolderOpen : Folder;
		return <Icon className={cn('text-blue-400', className)} />;
	}

	const Icon = getIconForFile(name);
	return <Icon className={cn('text-muted-foreground', className)} />;
}
