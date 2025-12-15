import { useAtom, useSetAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { X, Minus, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, memo, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface WindowFrameProps {
	windowState: WindowState;
	bounds: string;
}

export const WindowFrame = memo(function WindowFrame({ windowState, bounds }: WindowFrameProps) {
	const setWindows = useSetAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const {
		id,
		title,
		component,
		position,
		size,
		isMinimized,
		isMaximized: stateIsMaximized,
	} = windowState;
	const isMobile = useMediaQuery('(max-width: 768px)');

	// Force maximization on mobile, otherwise respect state
	const isMaximized = isMobile || stateIsMaximized;

	const zIndex = windowStack.indexOf(id) + 10;
	const isActive = activeWindowId === id;

	const bringToFront = useCallback(() => {
		if (windowStack.at(-1) !== id) {
			setWindowStack([...windowStack.filter(wid => wid !== id), id]);
		}
	}, [windowStack, id, setWindowStack]);

	useEffect(() => {
		if (isActive) {
			bringToFront();
		}
	}, [isActive, bringToFront]);

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

	// Snap Preview State
	const [snapPhantom, setSnapPhantom] = React.useState<null | 'left' | 'right' | 'top'>(null);

	// import type { DraggableEvent, DraggableData } from 'react-rnd';

	// More robust right edge detection
	const handleDragCallback = (e: any, d: any) => {
		// e is regular internal event, d is DraggableData
		if (!d.node.offsetParent) return;
		const parentWidth = d.node.offsetParent.offsetWidth;
		const pointerX = e.clientX || (e.touches && e.touches[0]?.clientX);
		const pointerY = e.clientY || (e.touches && e.touches[0]?.clientY);

		// Adjust pointer calculation based on sidebar offset if needed?
		// Logic: if pointer is close to screen bounds.
		// Since window is inside EditorArea which might be offset, we should check relative to viewport?
		// No, simplest is:

		if (pointerY < 60) {
			// Near top (TopBar is ~40px)
			setSnapPhantom('top');
		} else if (pointerX < 20) {
			setSnapPhantom('left');
		} else if (pointerX > window.innerWidth - 20) {
			setSnapPhantom('right');
		} else {
			setSnapPhantom(null);
		}
	};

	const handleDragStop = (e: any, d: any) => {
		const parentWidth = d.node.offsetParent?.offsetWidth || window.innerWidth;
		const parentHeight = d.node.offsetParent?.offsetHeight || window.innerHeight;

		if (snapPhantom === 'top') {
			setWindows(prev =>
				prev.map(w =>
					w.id === id ? { ...w, isMaximized: true, position: { x: 0, y: 0 } } : w,
				),
			);
		} else if (snapPhantom === 'left') {
			setWindows(prev =>
				prev.map(w =>
					w.id === id
						? {
								...w,
								isMaximized: false,
								position: { x: 0, y: 0 },
								size: { width: parentWidth / 2, height: parentHeight },
						  }
						: w,
				),
			);
		} else if (snapPhantom === 'right') {
			setWindows(prev =>
				prev.map(w =>
					w.id === id
						? {
								...w,
								isMaximized: false,
								position: { x: parentWidth / 2, y: 0 },
								size: { width: parentWidth / 2, height: parentHeight },
						  }
						: w,
				),
			);
		} else {
			// Normal move
			setWindows(prev =>
				prev.map(w => (w.id === id ? { ...w, position: { x: d.x, y: d.y } } : w)),
			);
		}
		setSnapPhantom(null);
	};

	import type { RndResizeStartCallback, RndResizeStopCallback, ResizeDirection } from 'react-rnd';

	const handleResizeStop: RndResizeStopCallback = (
		e,
		direction,
		ref,
		delta,
		position
	) => {
		setWindows(prev =>
			prev.map(w =>
				w.id === id
					? {
							...w,
							size: { width: ref.style.width, height: ref.style.height },
							position,
							isMaximized: false,
					  }
					: w,
			),
		);
	};

	return (
		<AnimatePresence mode="wait">
			{!isMinimized && (
				<>
					{/* Snap Phantom Overlay */}
					<AnimatePresence>
						{snapPhantom && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className={cn(
									'absolute bg-white/10 backdrop-blur-md border border-white/20 rounded-xl z-90 pointer-events-none transition-all duration-200',
									snapPhantom === 'top' && 'inset-0 m-4',
									snapPhantom === 'left' &&
										'top-4 bottom-4 left-4 w-[calc(50%-1rem)]',
									snapPhantom === 'right' &&
										'top-4 bottom-4 right-4 left-[calc(50%+0.5rem)]', // Approx
								)}
							/>
						)}
					</AnimatePresence>

					<motion.div
						key={id}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{
							duration: 0.2,
							ease: [0.22, 1, 0.36, 1],
						}}
						style={{
							position: 'absolute',
							inset: 0,
							zIndex,
						}}
						className={cn(isMaximized && 'pointer-events-none')} // Passthrough if maximized? No, Rnd handles it.
					>
						<Rnd
							size={isMaximized ? { width: '100%', height: '100%' } : size}
							position={isMaximized ? { x: 0, y: 0 } : position}
							disableDragging={isMaximized}
							enableResizing={!isMaximized}
							onDragStart={handleFocus}
							onDrag={handleDragCallback}
							onDragStop={handleDragStop}
							onResizeStop={handleResizeStop}
							bounds={bounds}
							minWidth={300}
							minHeight={200}
							style={{
								pointerEvents: 'auto', // Re-enable pointer events
								position: isMaximized ? 'relative' : 'absolute',
							}}
							className={cn(
								'flex flex-col overflow-hidden transition-shadow duration-300',
								// Active State Visuals: Glow and Border
								isActive
									? 'shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_20px_60px_-10px_rgba(0,0,0,0.6)]'
									: 'shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_10px_30px_-5px_rgba(0,0,0,0.4)] opacity-90',
							)}
							onMouseDown={handleFocus}
							dragHandleClassName="window-drag-handle"
						>
							{/* Title Bar - Premium Glassmorphism */}
							<div
								className={cn(
									'h-10 flex items-center justify-between px-4 shrink-0 transition-colors select-none relative z-50 window-drag-handle cursor-default',
									'bg-card/40 backdrop-blur-xl border-b border-border/10',
									isActive ? 'bg-card/60' : 'bg-card/20',
								)}
								onDoubleClick={() => {
									setWindows(prev =>
										prev.map(w =>
											w.id === id ? { ...w, isMaximized: !isMaximized } : w,
										),
									);
								}}
							>
								{/* Drag Handle Area */}
								{/* <div className="absolute inset-0 w-full h-full" /> REMOVE Overlay to allow buttons */}

								<span
									className={cn(
										'text-[13px] font-medium tracking-wide flex items-center gap-2 relative z-10 transition-colors',
										isActive ? 'text-foreground' : 'text-muted-foreground',
									)}
								>
									{/* Activity Dot */}
									<div
										className={cn(
											'w-2 h-2 rounded-full transition-colors',
											isActive
												? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]'
												: 'bg-muted-foreground/30',
										)}
									/>
									{title}
								</span>
								<div
									className="flex items-center gap-2 relative z-50"
									onMouseDown={e => e.stopPropagation()}
								>
									<button
										onClick={handleMinimize}
										className={cn(
											'group/min w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/20 transition-colors',
											isMobile && 'hidden',
										)}
										title="Minimize"
									>
										<Minus
											size={16}
											className="text-muted-foreground/60 group-hover/min:text-foreground transition-colors"
										/>
									</button>
									<button
										onClick={e => {
											e.stopPropagation();
											setWindows(prev =>
												prev.map(w =>
													w.id === id
														? { ...w, isMaximized: !isMaximized }
														: w,
												),
											);
										}}
										className="group/max w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/20 transition-colors sm:flex"
										title={isMaximized ? 'Restore' : 'Maximize'}
									>
										<Maximize
											size={14}
											className="text-muted-foreground/60 group-hover/max:text-foreground transition-colors"
										/>
									</button>
									<button
										onClick={handleClose}
										className="group/close w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
										title="Close"
									>
										<X
											size={16}
											className="text-muted-foreground/60 group-hover/close:text-destructive transition-colors"
										/>
									</button>
								</div>
							</div>
							{/* Content Background - Transparent to show 3D background */}
							<div className="grow overflow-auto bg-background/20 backdrop-blur-lg relative w-full h-full text-foreground">
								{component}
							</div>
						</Rnd>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
});

// Keyboard Shortcuts Hook
interface KeyboardShortcut {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean;
	handler: () => void;
	description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled) return;

			for (const shortcut of shortcuts) {
				const {
					key,
					ctrl = false,
					shift = false,
					alt = false,
					meta = false,
					handler,
				} = shortcut;

				const keyMatches = event.key.toLowerCase() === key.toLowerCase();
				const ctrlMatches = ctrl === (event.ctrlKey || event.metaKey); // Support both Ctrl and Cmd
				const shiftMatches = shift === event.shiftKey;
				const altMatches = alt === event.altKey;
				const metaMatches = meta === event.metaKey;

				if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
					event.preventDefault();
					handler();
					break;
				}
			}
		},
		[shortcuts, enabled],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);
}

// Helper to get all registered shortcuts for help display
export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
	const keys: string[] = [];

	if (shortcut.ctrl) keys.push('Ctrl');
	if (shortcut.shift) keys.push('Shift');
	if (shortcut.alt) keys.push('Alt');
	if (shortcut.meta) keys.push('Cmd');
	keys.push(shortcut.key.toUpperCase());

	return keys.join(' + ');
}
