'use client';

import { useAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { X, Minus, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WindowFrameProps {
	windowState: WindowState;
	bounds: string;
}

export function WindowFrame({ windowState, bounds }: WindowFrameProps) {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const { id, title, component, position, size, isMinimized } = windowState;
	const zIndex = windowStack.indexOf(id) + 10; // Base z-index of 10

	const bringToFront = () => {
		setActiveWindowId(id);
		if (windowStack.at(-1) !== id) {
			setWindowStack([...windowStack.filter(wid => wid !== id), id]);
		}
	};

	const handleClose = () => {
		setWindows(windows.filter(w => w.id !== id));
		setWindowStack(windowStack.filter(wid => wid !== id));
	};

	const handleMinimize = () => {
		setWindows(windows.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
	};

	return (
		<AnimatePresence>
			{!isMinimized && (
				<Rnd
					size={size}
					position={position}
					onDragStart={bringToFront}
					onDragStop={(e, d) => {
						setWindows(
							windows.map(w =>
								w.id === id ? { ...w, position: { x: d.x, y: d.y } } : w,
							),
						);
					}}
					onResizeStart={bringToFront}
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
						'bg-background/70 backdrop-blur-xl border border-border/60 rounded-lg shadow-2xl overflow-hidden flex flex-col',
					)}
				>
					{/* Title Bar */}
					<div
						className="handle h-8 flex items-center justify-between px-3 bg-black/10 border-b border-border/60 flex-shrink-0"
						onMouseDown={bringToFront}
						onDoubleClick={() => {
							/* Maximize logic can go here */
						}}
					>
						<span className="text-xs font-medium truncate">{title}</span>
						<div className="flex items-center gap-2">
							<button
								onClick={handleMinimize}
								className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
							>
								<Minus size={14} />
							</button>
							<button className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground">
								<Square size={12} />
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
