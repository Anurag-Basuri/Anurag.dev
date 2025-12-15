'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { FileSystemItem } from '@/types/file-system';
import {
	Folder,
	FolderOpen,
	File,
	ChevronRight,
	FileCode,
	FileJson,
	FileText,
	LayoutDashboard,
	Terminal,
	Database,
	Globe,
	Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { folderExpansionSignalAtom } from '@/store/atoms';

interface FolderTreeProps {
	items: FileSystemItem[];
	level?: number;
	onSelect?: (item: FileSystemItem) => void;
	activeModuleId?: string | null;
}

const getFileIcon = (name: string, moduleId?: string) => {
	// App shortcuts
	if (name.endsWith('.app')) {
		if (moduleId === 'projects') return <LayoutDashboard className="w-4 h-4 text-blue-400" />;
		if (moduleId === 'ailab') return <Terminal className="w-4 h-4 text-purple-400" />;
		if (moduleId === 'profiles') return <Database className="w-4 h-4 text-orange-400" />;
		if (moduleId === 'blog') return <Globe className="w-4 h-4 text-pink-400" />;
		return <Terminal className="w-4 h-4 text-emerald-400" />;
	}

	// File extensions
	if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-500/90" />;
	if (name.endsWith('.md') || name.endsWith('.txt'))
		return <FileText className="w-4 h-4 text-slate-400" />;
	if (name.endsWith('.tsx') || name.endsWith('.ts'))
		return <FileCode className="w-4 h-4 text-blue-500" />;
	if (name.endsWith('.js') || name.endsWith('.jsx'))
		return <FileCode className="w-4 h-4 text-yellow-400" />;
	if (name.endsWith('.css') || name.endsWith('.scss'))
		return <FileCode className="w-4 h-4 text-sky-400" />;
	if (name.endsWith('.pdf')) return <File className="w-4 h-4 text-red-400/90" />;
	if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg'))
		return <ImageIcon className="w-4 h-4 text-purple-400" />;

	return <File className="w-4 h-4 text-slate-500" />;
};

export function FolderTree({ items, level = 0, onSelect, activeModuleId }: FolderTreeProps) {
	return (
		<div className="w-full font-mono relative">
			{/* Connector line for nested levels */}
			{level > 0 && (
				<div
					className="absolute left-[11px] top-0 bottom-0 w-px bg-border/40"
					aria-hidden="true"
				/>
			)}
			{items.map(item => (
				<FolderTreeItem
					key={item.id}
					item={item}
					level={level}
					onSelect={onSelect}
					activeModuleId={activeModuleId}
				/>
			))}
		</div>
	);
}

function FolderTreeItem({
	item,
	level,
	onSelect,
	activeModuleId,
}: {
	item: FileSystemItem;
	level: number;
	onSelect?: (item: FileSystemItem) => void;
	activeModuleId?: string | null;
}) {
	const isFolder = item.type === 'folder';
	// Auto-expand root level folders by default
	const [isOpen, setIsOpen] = useState(
		isFolder && (level === 0 || item.name === 'src' || item.name === 'components'),
	);
	const [isHovered, setIsHovered] = useState(false);

	// Check if this file is active based on moduleId matching the active window
	const isActive = !isFolder && item.moduleId && item.moduleId === activeModuleId;

	const expansionSignal = useAtomValue(folderExpansionSignalAtom);

	React.useEffect(() => {
		if (isFolder && expansionSignal > 0) {
			setIsOpen(prev => !prev);
		}
	}, [expansionSignal, isFolder]);

	const handleToggle = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (isFolder) {
				setIsOpen(prev => !prev);
			} else {
				onSelect?.(item);
			}
		},
		[isFolder, item, onSelect],
	);

	return (
		<div className="relative">
			<div
				className={cn(
					'flex items-center py-1 px-2 cursor-pointer select-none text-[13px] transition-all duration-200 rounded-md group relative my-0.5',
					isActive ? 'text-emerald-300' : 'text-white/70 hover:text-white',
					level > 0 && 'ml-3.5', // Refined indentation
				)}
				onClick={handleToggle}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Hover/Active Background Indicator */}
				{(isHovered || isActive) && (
					<motion.div
						layoutId={isActive ? 'folder-active' : undefined}
						className={cn(
							'absolute inset-0 rounded-sm pointer-events-none',
							isActive
								? 'bg-emerald-500/10 border border-emerald-500/20'
								: 'bg-white/5',
						)}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
					/>
				)}

				{/* Arrow for folders */}
				<span className="mr-1.5 shrink-0 w-4 flex items-center justify-center text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">
					{isFolder && (
						<motion.span
							animate={{ rotate: isOpen ? 90 : 0 }}
							transition={{ duration: 0.15 }}
						>
							<ChevronRight className="w-3 h-3" />
						</motion.span>
					)}
				</span>

				{/* Icon */}
				<span className="mr-2 relative z-10 shrink-0">
					{isFolder ? (
						isOpen ? (
							<FolderOpen className="w-4 h-4 text-emerald-500/90" />
						) : (
							<Folder className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-500 transition-colors" />
						)
					) : (
						getFileIcon(item.name, item.moduleId)
					)}
				</span>

				{/* Label */}
				<span
					className={cn(
						'truncate relative z-10 font-medium tracking-tight',
						isActive && 'font-semibold',
					)}
				>
					{item.name}
				</span>
			</div>

			<AnimatePresence initial={false}>
				{isFolder && isOpen && item.children && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="overflow-hidden"
					>
						<FolderTree
							items={item.children}
							level={level + 1}
							onSelect={onSelect}
							activeModuleId={activeModuleId}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
