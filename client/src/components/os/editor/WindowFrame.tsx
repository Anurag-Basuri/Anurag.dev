'use client';

import { useAtom, useSetAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { X, Minus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, memo } from 'react';

interface WindowFrameProps {
	windowState: WindowState;
	bounds: string;
}

export const WindowFrame = memo(function WindowFrame({ windowState, bounds }: WindowFrameProps) {
	const setWindows = useSetAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const { id, title, component, position, size, isMinimized, isMaximized } = windowState;
	const zIndex = windowStack.indexOf(id) + 10;
	const isActive = activeWindowId === id;

	const bringToFront = () => {
		if (windowStack.at(-1) !== id) {
			setWindowStack([...windowStack.filter(wid => wid !== id), id]);
		}
	};

	useEffect(() => {
		if (isActive) {
			bringToFront();
		}
	}, [isActive]);

	const handleFocus = () => {
		setActiveWindowId(id);
		bringToFront();
	};

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setWindows(prev => prev.filter(w => w.id !== id));
		setWindowStack(windowStack.filter(wid => wid !== id));
		if (activeWindowId === id) {
			const remainingStack = windowStack.filter(wid => wid !== id);
			setActiveWindowId(remainingStack.at(-1) || null);
		}
	};

	const handleMinimize = (e: React.MouseEvent) => {
		e.stopPropagation();
		setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
		if (activeWindowId === id) {
			const remainingStack = windowStack.filter(wid => wid !== id);
			setActiveWindowId(remainingStack.at(-1) || null);
		}
	};

	// Force maximized state
	const maximizedProps = {
		size: { width: '100%', height: '100%' },
		position: { x: 0, y: 0 },
		disableDragging: true,
		enableResizing: false,
	};

	return (
		<AnimatePresence>
			{!isMinimized && (
				<Rnd
					{...maximizedProps}
					onDragStart={handleFocus}
					// Even though dragging is disabled, active state management remains
					style={{ zIndex }}
					className={cn(
						'bg-transparent overflow-hidden flex flex-col transition-all duration-300',
						// Removed border/shadow for seamless full-screen look
					)}
					onMouseDown={handleFocus}
				>
					{/* Title Bar - Minimalist and Transparent */}
					<div
						className={cn(
							'h-9 flex items-center justify-between px-4 shrink-0 transition-colors select-none',
							'bg-transparent', // Completely transparent header
						)}
					>
						<span className="text-[13px] font-medium tracking-wide text-white/80 flex items-center gap-2">
							{/* We could add an icon here if available in windowState */}
							{title}
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={handleMinimize}
								className="w-6 h-6 flex items-center justify-center text-white/40 hover:bg-yellow-500/20 hover:text-yellow-400 rounded-md transition-all"
								title="Minimize"
							>
								<Minus size={14} />
							</button>
							<button
								onClick={handleClose}
								className="w-6 h-6 flex items-center justify-center text-white/40 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
								title="Close"
							>
								<X size={14} />
							</button>
						</div>
					</div>
					{/* Content */}
					<div className="grow overflow-auto bg-transparent relative w-full h-full">
						{component}
					</div>
				</Rnd>
			)}
		</AnimatePresence>
	);
});
