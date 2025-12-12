'use client';

import React, { useState, useCallback } from 'react';
import { FileSystemItem } from '@/types/file-system';
import { Folder, FolderOpen, File, ChevronRight, FileCode, FileJson, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FolderTreeProps {
	items: FileSystemItem[];
	level?: number;
	onSelect?: (item: FileSystemItem) => void;
}

const FileIcon = ({ name }: { name: string }) => {
	if (name.endsWith('.json'))
		return <FileJson className="w-4 h-4 md:w-4 md:h-4 text-yellow-500/90" />;
	if (name.endsWith('.md') || name.endsWith('.txt'))
		return <FileText className="w-4 h-4 md:w-4 md:h-4 text-blue-400/90" />;
	if (
		name.endsWith('.py') ||
		name.endsWith('.js') ||
		name.endsWith('.tsx') ||
		name.endsWith('.ts')
	)
		return <FileCode className="w-4 h-4 md:w-4 md:h-4 text-emerald-400/90" />;
	if (name.endsWith('.pdf')) return <File className="w-4 h-4 md:w-4 md:h-4 text-red-400/90" />;
	return <File className="w-4 h-4 md:w-4 md:h-4 text-slate-400/60" />;
};

export function FolderTree({ items, level = 0, onSelect }: FolderTreeProps) {
	return (
		<div className="w-full font-mono relative">
			{/* Connector line for nested levels */}
			{level > 0 && (
				<div
					className="absolute left-[13px] top-0 bottom-0 w-px bg-white/5"
					aria-hidden="true"
				/>
			)}
			{items.map(item => (
				<FolderTreeItem key={item.id} item={item} level={level} onSelect={onSelect} />
			))}
		</div>
	);
}

function FolderTreeItem({
	item,
	level,
	onSelect,
}: {
	item: FileSystemItem;
	level: number;
	onSelect?: (item: FileSystemItem) => void;
}) {
	const isFolder = item.type === 'folder';
	// Auto-expand root level folders by default
	const [isOpen, setIsOpen] = useState(
		isFolder && (level === 0 || item.name === 'src' || item.name === 'components'),
	);
	const [isHovered, setIsHovered] = useState(false);

	React.useEffect(() => {
		const handleCollapse = () => {
			if (isFolder) setIsOpen(false);
		};
		// Custom event to collapse all
		window.addEventListener('collapse-all-folders', handleCollapse);
		return () => window.removeEventListener('collapse-all-folders', handleCollapse);
	}, [isFolder]);

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
					'flex items-center py-3 md:py-1.5 px-2 cursor-pointer select-none text-[13px] transition-all duration-150 rounded-sm group relative',
					'hover:bg-white/5',
					isHovered && !isFolder && 'text-emerald-400',
					level > 0 && 'ml-4', // Indentation
				)}
				onClick={handleToggle}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Hover Background Indicator */}
				{isHovered && (
					<motion.div
						layoutId="folder-hover"
						className="absolute inset-0 bg-white/4 rounded-sm pointer-events-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
					/>
				)}

				<motion.span
					animate={{ rotate: isFolder && isOpen ? 90 : 0 }}
					transition={{ duration: 0.2, ease: 'easeOut' }}
					className="mr-2 text-white/40 group-hover:text-white/80 transition-colors"
				>
					{isFolder ? (
						<ChevronRight className="w-3.5 h-3.5" />
					) : (
						<span className="w-3.5 h-3.5 inline-block" />
					)}
				</motion.span>

				<span className="mr-2.5 relative z-10">
					{isFolder ? (
						isOpen ? (
							<FolderOpen className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] transition-colors" />
						) : (
							<Folder className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-400 transition-colors" />
						)
					) : (
						<FileIcon name={item.name} />
					)}
				</span>

				<span
					className={cn(
						'truncate transition-colors duration-200 relative z-10',
						isFolder
							? 'text-white/90 font-semibold tracking-wide group-hover:text-white'
							: 'text-white/70 group-hover:text-white',
						item.name === 'secret' && 'text-white/30 italic',
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
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						className="overflow-hidden"
					>
						<FolderTree items={item.children} level={level + 1} onSelect={onSelect} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
