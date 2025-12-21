import React, { useState, useCallback, memo } from 'react';
import type { FileSystemItem } from '@/types/file-system';
import { Folder, FolderOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FileIcon } from '@/components/common/FileIcon';
import { getModuleTitle } from '@/lib/moduleRegistry';
import { useFolderTreeContext } from './FolderTreeContext';

interface FolderTreeItemProps {
	item: FileSystemItem;
	level: number;
}

export const FolderTreeItem = memo(function FolderTreeItem({ item, level }: FolderTreeItemProps) {
	const {
		expandedFolders,
		setExpandedFolders,
		focusedId,
		setFocusedId,
		activeModuleId,
		onSelect,
	} = useFolderTreeContext();
	const [isHovered, setIsHovered] = useState(false);

	const isFolder = item.type === 'folder';
	const isExpanded = expandedFolders.has(item.id);
	const isFocused = focusedId === item.id;
	const isActive = !isFolder && item.moduleId && item.moduleId === activeModuleId;

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			setFocusedId(item.id);
			if (isFolder) {
				setExpandedFolders(prev => {
					const next = new Set(prev);
					if (next.has(item.id)) {
						next.delete(item.id);
					} else {
						next.add(item.id);
					}
					return next;
				});
			} else {
				onSelect?.(item);
			}
		},
		[isFolder, item, onSelect, setExpandedFolders, setFocusedId],
	);

	const getDisplayName = (item: FileSystemItem) => {
		if (item.type === 'file' && item.moduleId) return getModuleTitle(item.moduleId);
		return item.name;
	};

	return (
		<div className="relative">
			<div
				id={`folder-item-${item.id}`}
				role="treeitem"
				aria-selected={isFocused}
				aria-expanded={isFolder ? isExpanded : undefined}
				className={cn(
					'flex items-center py-1 px-2 cursor-pointer select-none text-md transition-all duration-200 rounded-md group relative my-0.5 outline-none',
					isActive ? 'text-emerald-300' : 'text-white/70 hover:text-white',
					level > 0 && 'ml-3.5',
					isFocused && 'bg-white/10 ring-1 ring-inset ring-white/20',
				)}
				onClick={handleClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{(isHovered || isActive) && !isFocused && (
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

				<span className="mr-1.5 shrink-0 w-4 flex items-center justify-center text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">
					{isFolder && (
						<motion.span
							animate={{ rotate: isExpanded ? 90 : 0 }}
							transition={{ duration: 0.15 }}
						>
							<ChevronRight className="w-3 h-3" />
						</motion.span>
					)}
				</span>

				<span className="mr-2 relative z-10 shrink-0">
					{isFolder ? (
						isExpanded ? (
							<FolderOpen className="w-4 h-4 text-emerald-500/90" />
						) : (
							<Folder className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-500 transition-colors" />
						)
					) : (
						<FileIcon name={item.name} className="w-4 h-4" />
					)}
				</span>

				<span
					className={cn(
						'truncate relative z-10 font-medium tracking-tight',
						isActive && 'font-semibold',
					)}
				>
					{getDisplayName(item)}
				</span>
			</div>

			<AnimatePresence initial={false}>
				{isFolder && isExpanded && item.children && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="overflow-hidden"
					>
						<div className="relative">
							<div
								className="absolute left-[11px] top-0 bottom-0 w-px bg-border/40"
								aria-hidden="true"
							/>
							{item.children.map(child => (
								<FolderTreeItem key={child.id} item={child} level={level + 1} />
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});
