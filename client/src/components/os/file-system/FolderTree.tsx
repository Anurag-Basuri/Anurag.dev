'use client';

import React, { useState } from 'react';
import { FileSystemItem } from '@/lib/data';
import { Folder, FolderOpen, File, ChevronRight, FileCode, FileJson, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FolderTreeProps {
	items: FileSystemItem[];
	level?: number;
	onSelect?: (item: FileSystemItem) => void;
}

const FileIcon = ({ name }: { name: string }) => {
	if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-500/90" />;
	if (name.endsWith('.md') || name.endsWith('.txt'))
		return <FileText className="w-4 h-4 text-sky-500/90" />;
	if (
		name.endsWith('.py') ||
		name.endsWith('.js') ||
		name.endsWith('.tsx') ||
		name.endsWith('.exe')
	)
		return <FileCode className="w-4 h-4 text-emerald-500/90" />;
	if (name.endsWith('.pdf')) return <File className="w-4 h-4 text-red-500/90" />;
	return <File className="w-4 h-4 text-muted-foreground/40" />;
};

export function FolderTree({ items, level = 0, onSelect }: FolderTreeProps) {
	return (
		<div className="w-full font-mono">
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
	const [isOpen, setIsOpen] = useState(isFolder && level < 1);
	const [isHovered, setIsHovered] = useState(false);

	React.useEffect(() => {
		const handleCollapse = () => {
			if (isFolder) setIsOpen(false);
		};
		window.addEventListener('collapse-all-folders', handleCollapse);
		return () => window.removeEventListener('collapse-all-folders', handleCollapse);
	}, [isFolder]);

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFolder) {
			setIsOpen(prev => !prev);
		} else {
			onSelect?.(item);
		}
	};

	return (
		<div>
			<div
				className={cn(
					'flex items-center py-1.5 px-2.5 cursor-pointer select-none text-xs transition-all duration-200 rounded-md group relative',
					'hover:bg-accent/10 hover:text-accent-foreground',
					isHovered && 'bg-accent/5',
					level > 0 && 'ml-2',
					// Selected state visualization
					isHovered && !isFolder && 'transform translate-x-1',
				)}
				style={{ paddingLeft: `${level * 14 + 10}px` }}
				onClick={handleToggle}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Tree Guide Line */}
				{level > 0 && (
					<div
						className="absolute left-0 top-0 bottom-0 w-px bg-border/20 group-hover:bg-border/40 transition-colors"
						style={{ left: `${(level - 1) * 14 + 14}px` }}
					/>
				)}

				<motion.span
					animate={{ rotate: isFolder && isOpen ? 90 : 0 }}
					transition={{ duration: 0.2, ease: 'easeOut' }}
					className="mr-1.5 text-muted-foreground group-hover:text-foreground flex items-center justify-center transition-colors"
				>
					{isFolder ? (
						<ChevronRight className="w-3.5 h-3.5" />
					) : (
						<span className="w-3.5 h-3.5 inline-block" />
					)}
				</motion.span>

				<span className="mr-2">
					{isFolder ? (
						isOpen ? (
							<FolderOpen className="w-4 h-4 text-primary drop-shadow-sm" />
						) : (
							<Folder className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
						)
					) : (
						<FileIcon name={item.name} />
					)}
				</span>

				<span
					className={cn(
						'truncate transition-colors font-medium',
						isFolder
							? 'text-foreground/90 group-hover:text-foreground'
							: 'text-muted-foreground group-hover:text-foreground',
						item.name === 'secret' && 'text-muted-foreground/50 italic',
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
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						style={{ overflow: 'hidden' }}
					>
						<FolderTree items={item.children} level={level + 1} onSelect={onSelect} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
