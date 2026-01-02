'use client';

import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import type { FileSystemItem } from '@/types/file-system';
import { useAtomValue } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';
import { FolderTreeContext } from './FolderTreeContext';
import { FolderTreeItem } from './FolderTreeItem';
import { useKeyboardNavigation } from './useKeyboardNavigation';

interface FolderTreeProps {
	items: FileSystemItem[];
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

export function FolderTree({ items, onSelect, activeModuleId }: FolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
		// Initialize with default expanded folders
		const defaults = new Set<string>();
		items.forEach(item => {
			if (
				item.type === 'folder' &&
				['bio', 'work', 'connect', 'src', 'components'].includes(item.name)
			) {
				defaults.add(item.id);
			}
		});
		return defaults;
	});

	const [focusedId, setFocusedId] = useState<string | null>(null);
	const treeRef = useRef<HTMLDivElement>(null);
	const expansionSignal = useAtomValue(folderExpansionSignalAtom);

	// Flatten tree for navigation
	const flatItems = useMemo(() => flattenTree(items, expandedFolders), [items, expandedFolders]);

	// Keyboard navigation hook
	const { handleKeyDown } = useKeyboardNavigation(
		flatItems,
		focusedId,
		setFocusedId,
		expandedFolders,
		setExpandedFolders,
		onSelect,
	);

	// Handle external expansion signal (collapse all toggle)
	useEffect(() => {
		if (expansionSignal > 0) {
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

			setTimeout(() => {
				setExpandedFolders(prev => {
					const areAllExpanded = Array.from(allFolderIds).every(id => prev.has(id));
					return areAllExpanded ? new Set() : allFolderIds;
				});
			}, 0);
		}
	}, [expansionSignal, items]);

	const contextValue = useMemo(
		() => ({
			expandedFolders,
			setExpandedFolders,
			focusedId,
			setFocusedId,
			activeModuleId: activeModuleId ?? null,
			onSelect,
		}),
		[expandedFolders, focusedId, activeModuleId, onSelect],
	);

	return (
		<FolderTreeContext.Provider value={contextValue}>
			<div
				className="w-full font-mono relative outline-none"
				tabIndex={0}
				onKeyDown={handleKeyDown}
				ref={treeRef}
				role="tree"
			>
				<RecursiveFolderTree items={items} level={0} />
			</div>
		</FolderTreeContext.Provider>
	);
}

// Recursive tree renderer
// Recursive tree renderer - Memoized to prevent full tree re-renders on leaf changes
const RecursiveFolderTree = memo(function RecursiveFolderTree({
	items,
	level,
}: {
	items: FileSystemItem[];
	level: number;
}) {
	return (
		<div className="relative">
			{level > 0 && (
				<div
					className="absolute left-[11px] top-0 bottom-0 w-px bg-border/40"
					aria-hidden="true"
				/>
			)}
			{items.map(item => (
				<FolderTreeItem key={item.id} item={item} level={level} />
			))}
		</div>
	);
});
