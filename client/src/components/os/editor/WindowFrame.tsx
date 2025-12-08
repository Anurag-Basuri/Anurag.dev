'use client';

import { useAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { X, Minus, Square, ChevronsLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface WindowFrameProps {
	windowState: WindowState;
	bounds: string;
}

export function WindowFrame({ windowState, bounds }: WindowFrameProps) {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const { id, title, component, position, size, isMinimized, isMaximized } = windowState;
	const zIndex = windowStack.indexOf(id) + 10;
	const isActive = activeWindowId === id;

	// Store pre-maximized state
	const [preMaximizeState, setPreMaximizeState] = useState({
		position,
		size,
	});

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

	const handleClose = () => {
		setWindows(windows.filter(w => w.id !== id));
		setWindowStack(windowStack.filter(wid => wid !== id));
		if (activeWindowId === id) {
			setActiveWindowId(windowStack.at(-2) || null);
		}
	};

	const handleMinimize = () => {
		setWindows(windows.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
		if (activeWindowId === id) {
			setActiveWindowId(windowStack.at(-2) || null);
		}
	};

	const handleMaximizeToggle = () => {
		if (isMaximized) {
			// Restore
			setWindows(
				windows.map(w =>
					w.id === id
						? {
								...w,
								isMaximized: false,
								position: preMaximizeState.position,
								size: preMaximizeState.size,
						  }
						: w,
				),
			);
		} else {
			// Maximize
			setPreMaximizeState({ position, size });
			setWindows(windows.map(w => (w.id === id ? { ...w, isMaximized: true } : w)));
		}
	};

	const maximizedProps = isMaximized
		? {
				size: { width: '100%', height: '100%' },
				position: { x: 0, y: 0 },
				disableDragging: true,
				enableResizing: false,
		  }
		: {
				size,
				position,
				disableDragging: false,
				enableResizing: true,
		  };

	return (
		<AnimatePresence>
			{!isMinimized && (
				<Rnd
					{...maximizedProps}
					onDragStart={handleFocus}
					onDragStop={(e, d) => {
						setWindows(
							windows.map(w =>
								w.id === id ? { ...w, position: { x: d.x, y: d.y } } : w,
							),
						);
					}}
					onResizeStart={handleFocus}
					onResizeStop={(e, direction, ref, delta, newPosition) => {
						setWindows(
							windows.map(w =>
								w.id === id
									? {
											...w,
											size: {
												width: ref.style.width,
												height: ref.style.height,
											},
											position: newPosition,
									  }
									: w,
							),
						);
					}}
					minWidth={300}
					minHeight={200}
					dragHandleClassName="handle"
					bounds={bounds}
					style={{ zIndex }}
					className={cn(
						'bg-background/70 backdrop-blur-xl border rounded-lg shadow-2xl overflow-hidden flex flex-col transition-colors',
						isActive ? 'border-primary/50' : 'border-border/60',
					)}
					onMouseDown={handleFocus}
				>
					{/* Title Bar */}
					<div
						className={cn(
							'handle h-8 flex items-center justify-between px-3 border-b flex-shrink-0 transition-colors',
							isActive
								? 'bg-primary/20 border-primary/40'
								: 'bg-black/10 border-border/60',
						)}
						onDoubleClick={handleMaximizeToggle}
					>
						<span className="text-xs font-medium truncate">{title}</span>
						<div className="flex items-center gap-2">
							<button
								onClick={handleMinimize}
								className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
							>
								<Minus size={14} />
							</button>
							<button
								onClick={handleMaximizeToggle}
								className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
							>
								{isMaximized ? <ChevronsLeft size={12} /> : <Square size={12} />}
							</button>
							<button
								onClick={handleClose}
								className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground rounded-sm"
							>
								<X size={14} />
							</button>
						</div>
					</div>
					{/* Content */}
					<div className="flex-grow overflow-auto">{component}</div>
				</Rnd>
			)}
		</AnimatePresence>
	);
}
