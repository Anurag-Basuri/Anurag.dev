import React from 'react';
import {
	File,
	FileCode,
	FileJson,
	FileText,
	LayoutDashboard,
	Terminal,
	Database,
	Globe,
	Image as ImageIcon,
	type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
	name: string;
	moduleId?: string;
	className?: string;
}

/**
 * Get the appropriate icon and color for a file based on its name
 * @param name - File name (including extension)
 * @param moduleId - Optional module ID for .app files
 * @returns Icon component and color class
 */
export function getIconForFile(name: string, moduleId?: string): LucideIcon {
	// App shortcuts
	if (name.endsWith('.app')) {
		if (moduleId === 'projects') return LayoutDashboard;
		if (moduleId === 'ailab') return Terminal;
		if (moduleId === 'profiles') return Database;
		if (moduleId === 'blog') return Globe;
		return Terminal;
	}

	// File extensions
	if (name.endsWith('.json')) return FileJson;
	if (name.endsWith('.md') || name.endsWith('.txt')) return FileText;
	if (name.endsWith('.tsx') || name.endsWith('.ts')) return FileCode;
	if (name.endsWith('.js') || name.endsWith('.jsx')) return FileCode;
	if (name.endsWith('.css') || name.endsWith('.scss')) return FileCode;
	if (name.endsWith('.pdf')) return File;
	if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return ImageIcon;

	return File;
}

export function FileIcon({ name, moduleId, className }: FileIconProps) {
	const getIcon = () => {
		// App shortcuts
		if (name.endsWith('.app')) {
			if (moduleId === 'projects') return { icon: LayoutDashboard, color: 'text-blue-400' };
			if (moduleId === 'ailab') return { icon: Terminal, color: 'text-purple-400' };
			if (moduleId === 'profiles') return { icon: Database, color: 'text-orange-400' };
			if (moduleId === 'blog') return { icon: Globe, color: 'text-pink-400' };
			return { icon: Terminal, color: 'text-emerald-400' };
		}

		// File extensions
		if (name.endsWith('.json')) return { icon: FileJson, color: 'text-yellow-500/90' };
		if (name.endsWith('.md') || name.endsWith('.txt'))
			return { icon: FileText, color: 'text-slate-400' };
		if (name.endsWith('.tsx') || name.endsWith('.ts'))
			return { icon: FileCode, color: 'text-blue-500' };
		if (name.endsWith('.js') || name.endsWith('.jsx'))
			return { icon: FileCode, color: 'text-yellow-400' };
		if (name.endsWith('.css') || name.endsWith('.scss'))
			return { icon: FileCode, color: 'text-sky-400' };
		if (name.endsWith('.pdf')) return { icon: File, color: 'text-red-400/90' };
		if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg'))
			return { icon: ImageIcon, color: 'text-purple-400' };

		return { icon: File, color: 'text-slate-500' };
	};

	const { icon: Icon, color } = getIcon();

	return <Icon className={cn('shrink-0', color, className)} />;
}
