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
	if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-500" />;
	if (name.endsWith('.md') || name.endsWith('.txt'))
		return <FileText className="w-4 h-4 text-primary" />;
	if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.tsx'))
		return <FileCode className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
	return <File className="w-4 h-4 text-muted-foreground" />;
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
					'flex items-center py-1 px-2 cursor-pointer select-none text-xs transition-all duration-200 rounded-sm group border border-transparent relative',
					'hover:bg-muted/30 hover:backdrop-blur-sm hover:border-border/50',
					level > 0 && 'ml-2',
				)}
				style={{ paddingLeft: `${level * 12 + 8}px` }}
				onClick={handleToggle}
			>
				{/* Tree Guide Line */}
				{level > 0 && (
					<div
						className="absolute left-0 top-0 bottom-0 w-px bg-border/30 group-hover:bg-border/60 transition-colors"
						style={{ left: `${(level - 1) * 12 + 12}px` }}
					/>
				)}
				<motion.span
					animate={{ rotate: isFolder && isOpen ? 90 : 0 }}
					transition={{ duration: 0.15 }}
					className="mr-1 text-muted-foreground group-hover:text-primary flex items-center justify-center transition-colors"
				>
					{isFolder ? (
						<ChevronRight className="w-3 h-3" />
					) : (
						<span className="w-3 h-3 inline-block" />
					)}
				</motion.span>

				<span className="mr-2">
					{isFolder ? (
						isOpen ? (
							<FolderOpen className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
						) : (
							<Folder className="w-4 h-4 text-primary/80 group-hover:text-primary transition-colors" />
						)
					) : (
						<FileIcon name={item.name} />
					)}
				</span>

				<span
					className={cn(
						'truncate transition-colors text-muted-foreground group-hover:text-foreground font-medium',
						item.name === 'secret' && 'text-muted-foreground/50',
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
						transition={{ duration: 0.18, ease: 'easeInOut' }}
						style={{ overflow: 'hidden' }}
					>
						<FolderTree items={item.children} level={level + 1} onSelect={onSelect} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
