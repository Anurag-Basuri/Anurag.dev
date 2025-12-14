'use client';

import React, { useCallback } from 'react';
import { useContextMenu } from '@/components/providers/context-menu-provider';
import { DesktopContextMenu } from './DesktopContextMenu';

export function ContextMenuWrapper({ children }: { children: React.ReactNode }) {
	const { showMenu } = useContextMenu();

	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			showMenu(e.clientX, e.clientY);
		},
		[showMenu],
	);

	return (
		<div className="h-full w-full" onContextMenu={handleContextMenu}>
			{children}
			<DesktopContextMenu />
		</div>
	);
}
