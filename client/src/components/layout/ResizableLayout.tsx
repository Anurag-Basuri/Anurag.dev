'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ResizableLayoutProps {
	sidebar: React.ReactNode;
	main: React.ReactNode;
	terminal: React.ReactNode;
	sidebarCollapsed?: boolean;
	terminalCollapsed?: boolean;
}

export function ResizableLayout({
	sidebar,
	main,
	terminal,
	sidebarCollapsed = false,
	terminalCollapsed = false,
}: ResizableLayoutProps) {
	const [sidebarWidth, setSidebarWidth] = useState(250); // px
	const [terminalHeight, setTerminalHeight] = useState(200); // px
	const containerRef = useRef<HTMLDivElement>(null);
	const isDraggingRef = useRef<'sidebar' | 'terminal' | null>(null);

	const handleMouseDown = useCallback((type: 'sidebar' | 'terminal') => {
		isDraggingRef.current = type;
		document.body.style.cursor = type === 'sidebar' ? 'col-resize' : 'row-resize';
		document.body.style.userSelect = 'none';
	}, []);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDraggingRef.current || !containerRef.current) return;

		if (isDraggingRef.current === 'sidebar') {
			const containerRect = containerRef.current.getBoundingClientRect();
			const newWidth = e.clientX - containerRect.left;
			setSidebarWidth(Math.max(150, Math.min(500, newWidth)));
		} else if (isDraggingRef.current === 'terminal') {
			const containerRect = containerRef.current.getBoundingClientRect();
			const newHeight = containerRect.bottom - e.clientY;
			setTerminalHeight(Math.max(100, Math.min(600, newHeight)));
		}
	}, []);

	const handleMouseUp = useCallback(() => {
		isDraggingRef.current = null;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}, []);

	React.useEffect(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

	return (
		<div ref={containerRef} className="h-full w-full flex gap-1">
			{/* Sidebar */}
			<div
				style={{ width: sidebarCollapsed ? '48px' : `${sidebarWidth}px` }}
				className="flex-shrink-0 transition-all duration-200"
			>
				{sidebar}
			</div>

			{/* Sidebar Resize Handle */}
			{!sidebarCollapsed && (
				<div
					onMouseDown={() => handleMouseDown('sidebar')}
					className="w-[2px] bg-border hover:bg-primary/80 cursor-col-resize flex-shrink-0 active:bg-primary"
				/>
			)}

			{/* Main + Terminal Column */}
			<div className="flex-1 flex flex-col gap-1 min-w-0">
				{/* Main Content */}
				<div className="flex-1 min-h-0">{main}</div>

				{/* Terminal Resize Handle */}
				{!terminalCollapsed && (
					<div
						onMouseDown={() => handleMouseDown('terminal')}
						className="h-[2px] bg-border hover:bg-primary/80 cursor-row-resize flex-shrink-0 active:bg-primary"
					/>
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
