'use client';

import { useMemo } from 'react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface UseLayoutShortcutsProps {
	toggleSidebar: () => void;
	toggleTerminal: () => void;
	isMaximized: boolean;
	restore: () => void;
}

// Hook for layout keyboard shortcuts
export function useLayoutShortcuts({
	toggleSidebar,
	toggleTerminal,
	isMaximized,
	restore,
}: UseLayoutShortcutsProps) {
	const shortcuts = useMemo(
		() => [
			{
				key: 'b',
				ctrl: true,
				handler: toggleSidebar,
				description: 'Toggle sidebar',
			},
			{
				key: 'j',
				ctrl: true,
				handler: toggleTerminal,
				description: 'Toggle terminal',
			},
			{
				key: 'Escape',
				handler: () => {
					if (isMaximized) restore();
				},
				description: 'Close maximized panel',
			},
			{
				key: 'k',
				ctrl: true,
				shift: true,
				handler: () => {
					document
						.querySelector<HTMLInputElement>('input[aria-label="Command input"]')
						?.focus();
				},
				description: 'Focus terminal',
			},
		],
		[toggleSidebar, toggleTerminal, isMaximized, restore],
	);

	useKeyboardShortcuts(shortcuts);
}
