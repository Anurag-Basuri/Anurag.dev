'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FileSystemItem } from '@/types/file-system';
import { Folder, FolderOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';
import { FileIcon } from '@/components/shared/FileIcon';

interface FolderTreeProps {
	items: FileSystemItem[];
	level?: number;
	onSelect?: (item: FileSystemItem) => void;
	activeModuleId?: string | null;
}

// Flatten the tree for keyboard navigation
const flattenTree = (
	items: FileSystemItem[],
	expandedFolders: Set<string>,
	level = 0,
): { item: FileSystemItem; level: number }[] => {
	return items.flatMap(item => {
		const result = [{ item, level }];
		if (item.type === 'folder' && expandedFolders.has(item.id) && item.children) {
			result.push(...flattenTree(item.children, expandedFolders, level + 1));
		}
		return result;
	});
};

export function FolderTree({ items, level = 0, onSelect, activeModuleId }: FolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
		// Initialize with default expanded folders
		const defaults = new Set<string>();
		const initExpand = (items: FileSystemItem[]) => {
			items.forEach(item => {
				if (item.type === 'folder' && (item.name === 'src' || item.name === 'components')) {
					defaults.add(item.id);
					if (item.children) initExpand(item.children);
				}
			});
		};
		if (level === 0) initExpand(items);
		return defaults;
	});

	const [focusedId, setFocusedId] = useState<string | null>(null);
	const treeRef = useRef<HTMLDivElement>(null);
	const expansionSignal = useAtomValue(folderExpansionSignalAtom);

	// Flatten tree for navigation
	const flatItems = useMemo(() => flattenTree(items, expandedFolders), [items, expandedFolders]);

	// Handle external expansion signal
	useEffect(() => {
		if (expansionSignal > 0) {
			// Expand all visible folders
			const allFolderIds = new Set<string>();
			const collectFolders = (nodes: FileSystemItem[]) => {
				nodes.forEach(node => {
					if (node.type === 'folder') {
						allFolderIds.add(node.id);
						if (node.children) collectFolders(node.children);
					}
				});
			};
			collectFolders(items);
		}
	}, [expansionSignal, items]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!focusedId && flatItems.length > 0) {
				setFocusedId(flatItems[0].item.id);
				return;
			}

			const currentIndex = flatItems.findIndex(f => f.item.id === focusedId);
			if (currentIndex === -1) return;

			const currentItem = flatItems[currentIndex].item;

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					if (currentIndex < flatItems.length - 1) {
						setFocusedId(flatItems[currentIndex + 1].item.id);
					}
					break;
				case 'ArrowUp':
					e.preventDefault();
					if (currentIndex > 0) {
						setFocusedId(flatItems[currentIndex - 1].item.id);
					}
					break;
				case 'ArrowRight':
					e.preventDefault();
					if (currentItem.type === 'folder') {
						if (expandedFolders.has(currentItem.id)) {
							// Go to first child if exists
							if (currentIndex < flatItems.length - 1) {
								setFocusedId(flatItems[currentIndex + 1].item.id);
							}
						} else {
							// Expand
							const next = new Set(expandedFolders);
							next.add(currentItem.id);
							setExpandedFolders(next);
						}
					}
					break;
				case 'ArrowLeft':
					e.preventDefault();
					if (currentItem.type === 'folder' && expandedFolders.has(currentItem.id)) {
						// Collapse
						const next = new Set(expandedFolders);
						next.delete(currentItem.id);
						setExpandedFolders(next);
					} else {
						// Go to parent
						const currentLevel = flatItems[currentIndex].level;
						for (let i = currentIndex - 1; i >= 0; i--) {
							if (flatItems[i].level < currentLevel) {
								setFocusedId(flatItems[i].item.id);
								break;
							}
						}
					}
					break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					if (currentItem.type === 'folder') {
						const next = new Set(expandedFolders);
						if (next.has(currentItem.id)) {
							next.delete(currentItem.id);
						} else {
							next.add(currentItem.id);
						}
						setExpandedFolders(next);
					} else {
						onSelect?.(currentItem);
					}
					break;
			}
		},
		[focusedId, flatItems, expandedFolders, onSelect],
	);

	// Ensure focused item is visible
	useEffect(() => {
		if (focusedId) {
			const element = document.getElementById(`folder-item-${focusedId}`);
			element?.scrollIntoView({ block: 'nearest' });
		}
	}, [focusedId]);

	return (
		<div
			className="w-full font-mono relative outline-none"
			tabIndex={0}
			onKeyDown={handleKeyDown}
			ref={treeRef}
			role="tree"
		>
			<RecursiveFolderTree
				items={items}
				level={0}
				onSelect={onSelect}
				activeModuleId={activeModuleId}
				expandedFolders={expandedFolders}
				setExpandedFolders={setExpandedFolders}
				focusedId={focusedId}
				setFocusedId={setFocusedId}
			/>
		</div>
	);
}

interface RecursiveProps {
	items: FileSystemItem[];
	level: number;
	onSelect?: (item: FileSystemItem) => void;
	activeModuleId?: string | null;
	expandedFolders: Set<string>;
	setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
	focusedId: string | null;
	setFocusedId: (id: string) => void;
}

function RecursiveFolderTree({
	items,
	level,
	onSelect,
	activeModuleId,
	expandedFolders,
	setExpandedFolders,
	focusedId,
	setFocusedId,
}: RecursiveProps) {
	return (
		<>
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
					isExpanded={expandedFolders.has(item.id)}
					onToggle={() => {
						setExpandedFolders(prev => {
							const next = new Set(prev);
							if (next.has(item.id)) next.delete(item.id);
							else next.add(item.id);
							return next;
						});
						setFocusedId(item.id);
					}}
					isFocused={focusedId === item.id}
					onFocus={() => setFocusedId(item.id)}
					expandedFolders={expandedFolders}
					setExpandedFolders={setExpandedFolders}
					focusedId={focusedId}
					setFocusedId={setFocusedId}
				/>
			))}
		</>
	);
}

interface FolderTreeItemProps extends Omit<RecursiveProps, 'items'> {
	item: FileSystemItem;
	isExpanded: boolean;
	onToggle: () => void;
	isFocused: boolean;
	onFocus: () => void;
}

function FolderTreeItem({
	item,
	level,
	onSelect,
	activeModuleId,
	isExpanded,
	onToggle,
	isFocused,
	onFocus,
	expandedFolders,
	setExpandedFolders,
	focusedId,
	setFocusedId,
}: FolderTreeItemProps) {
	const isFolder = item.type === 'folder';
	const [isHovered, setIsHovered] = useState(false);

	const isActive = !isFolder && item.moduleId && item.moduleId === activeModuleId;

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onFocus();
			if (isFolder) {
				onToggle();
			} else {
				onSelect?.(item);
			}
		},
		[isFolder, item, onSelect, onToggle, onFocus],
	);

	return (
		<div className="relative">
			<div
				id={`folder-item-${item.id}`}
				role="treeitem"
				aria-selected={isFocused}
				aria-expanded={isFolder ? isExpanded : undefined}
				className={cn(
					'flex items-center py-1 px-2 cursor-pointer select-none text-[13px] transition-all duration-200 rounded-md group relative my-0.5 outline-none',
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
						<FileIcon name={item.name} moduleId={item.moduleId} className="w-4 h-4" />
					)}
				</span>

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
				{isFolder && isExpanded && item.children && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="overflow-hidden"
					>
						<RecursiveFolderTree
							items={item.children}
							level={level + 1}
							onSelect={onSelect}
							activeModuleId={activeModuleId}
							expandedFolders={expandedFolders}
							setExpandedFolders={setExpandedFolders}
							focusedId={focusedId}
							setFocusedId={setFocusedId}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
