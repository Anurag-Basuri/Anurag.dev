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
	if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-500" />;
	if (name.endsWith('.md') || name.endsWith('.txt'))
		return <FileText className="w-4 h-4 text-blue-400" />;
	if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.tsx'))
		return <FileCode className="w-4 h-4 text-green-500" />;
	return <File className="w-4 h-4 text-zinc-500" />;
};

export function FolderTree({ items, level = 0, onSelect }: FolderTreeProps) {
	return (
		<div className="w-full">
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
					'flex items-center py-1 px-2 hover:bg-white/10 cursor-pointer select-none text-sm transition-colors rounded-sm',
					level > 0 && 'ml-2',
				)}
				style={{ paddingLeft: `${level * 12 + 8}px` }}
				onClick={handleToggle}
			>
				<motion.span
					animate={{ rotate: isFolder && isOpen ? 90 : 0 }}
					transition={{ duration: 0.15 }}
					className="mr-1 opacity-70 flex items-center justify-center"
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
							<FolderOpen className="w-4 h-4 text-blue-400" />
						) : (
							<Folder className="w-4 h-4 text-blue-400" />
						)
					) : (
						<FileIcon name={item.name} />
					)}
				</span>

				<span
					className={cn(
						'truncate transition-colors',
						item.name === 'secret' && 'text-zinc-500',
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
