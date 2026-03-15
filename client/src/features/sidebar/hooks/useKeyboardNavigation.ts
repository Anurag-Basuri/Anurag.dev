import { useCallback, useEffect } from 'react';
import type { FileSystemItem } from '@/types/file-system';
import type { Dispatch, SetStateAction, KeyboardEvent } from 'react';

interface FlatItem {
	item: FileSystemItem;
	level: number;
}

export function useKeyboardNavigation(
	flatItems: FlatItem[],
	focusedId: string | null,
	setFocusedId: (id: string | null) => void,
	expandedFolders: Set<string>,
	setExpandedFolders: Dispatch<SetStateAction<Set<string>>>,
	onSelect?: (item: FileSystemItem) => void,
) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
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
							setExpandedFolders(prev => new Set(prev).add(currentItem.id));
						}
					}
					break;
				case 'ArrowLeft':
					e.preventDefault();
					if (currentItem.type === 'folder' && expandedFolders.has(currentItem.id)) {
						// Collapse
						setExpandedFolders(prev => {
							const next = new Set(prev);
							next.delete(currentItem.id);
							return next;
						});
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
						setExpandedFolders(prev => {
							const next = new Set(prev);
							if (next.has(currentItem.id)) {
								next.delete(currentItem.id);
							} else {
								next.add(currentItem.id);
							}
							return next;
						});
					} else {
						onSelect?.(currentItem);
					}
					break;
			}
		},
		[focusedId, flatItems, expandedFolders, onSelect, setExpandedFolders, setFocusedId],
	);

	// Ensure focused item is visible
	useEffect(() => {
		if (focusedId) {
			const element = document.getElementById(`folder-item-${focusedId}`);
			element?.scrollIntoView({ block: 'nearest' });
		}
	}, [focusedId]);

	return { handleKeyDown };
}
