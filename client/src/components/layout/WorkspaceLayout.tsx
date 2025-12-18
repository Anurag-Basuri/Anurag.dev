'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { ResizeHandle } from './ResizeHandle';
import { cn } from '@/lib/utils';

// Persistent atoms for layout sizes
const sidebarWidthAtom = atomWithStorage('workspace-sidebar-width', 250);
const terminalHeightAtom = atomWithStorage('workspace-terminal-height', 200);

interface WorkspaceLayoutProps {
	sidebar: React.ReactNode;
	main: React.ReactNode;
	terminal: React.ReactNode;
	sidebarCollapsed?: boolean;
	terminalCollapsed?: boolean;
}

export function WorkspaceLayout({
	sidebar,
	main,
	terminal,
	sidebarCollapsed = false,
	terminalCollapsed = false,
}: WorkspaceLayoutProps) {
	const [sidebarWidth, setSidebarWidth] = useAtom(sidebarWidthAtom);
	const [terminalHeight, setTerminalHeight] = useAtom(terminalHeightAtom);
	const startSizeRef = useRef({ sidebar: sidebarWidth, terminal: terminalHeight });

	// Update start size when collapsed state changes
	useEffect(() => {
		startSizeRef.current = { sidebar: sidebarWidth, terminal: terminalHeight };
	}, [sidebarCollapsed, terminalCollapsed, sidebarWidth, terminalHeight]);

	const handleSidebarResize = (delta: number) => {
		const newWidth = Math.max(150, Math.min(500, startSizeRef.current.sidebar + delta));
		setSidebarWidth(newWidth);
	};

	const handleTerminalResize = (delta: number) => {
		const newHeight = Math.max(100, Math.min(600, startSizeRef.current.terminal - delta));
		setTerminalHeight(newHeight);
	};

	return (
		<div className="h-full w-full flex">
			{/* Sidebar */}
			<div
				style={{ width: sidebarCollapsed ? '48px' : `${sidebarWidth}px` }}
				className="flex-shrink-0 transition-all duration-200"
			>
				{sidebar}
			</div>

			{/* Sidebar Resize Handle */}
			{!sidebarCollapsed && (
				<ResizeHandle direction="horizontal" onResize={handleSidebarResize} />
			)}

			{/* Main + Terminal Column */}
			<div className="flex-1 min-w-0 flex flex-col">
				{/* Main Content */}
				<div className="flex-1 min-h-0">{main}</div>

				{/* Terminal Resize Handle */}
				{!terminalCollapsed && (
					<ResizeHandle direction="vertical" onResize={handleTerminalResize} />
				)}

				{/* Terminal */}
				{!terminalCollapsed && (
					<div style={{ height: `${terminalHeight}px` }} className="flex-shrink-0">
						{terminal}
					</div>
				)}
			</div>
		</div>
	);
}
