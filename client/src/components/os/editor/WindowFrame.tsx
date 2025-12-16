import { useAtom, useSetAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, memo, useCallback, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WindowControls } from '@/components/shared/WindowControls';
import type { RndResizeStopCallback } from 'react-rnd';

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

	const handleClose = useCallback(
		(e?: React.MouseEvent) => {
			e?.stopPropagation();
			setWindows(prev => prev.filter(w => w.id !== id));
			setWindowStack(windowStack.filter(wid => wid !== id));
			if (activeWindowId === id) {
				const remainingStack = windowStack.filter(wid => wid !== id);
				setActiveWindowId(remainingStack.at(-1) || null);
			}
		},
		[id, windowStack, activeWindowId, setWindows, setWindowStack, setActiveWindowId],
	);

	const handleMinimize = useCallback(
		(e?: React.MouseEvent) => {
			e?.stopPropagation();
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
			if (activeWindowId === id) {
				const remainingStack = windowStack.filter(wid => wid !== id);
				setActiveWindowId(remainingStack.at(-1) || null);
			}
		},
		[id, activeWindowId, windowStack, setWindows, setActiveWindowId],
	);

	const handleMaximize = useCallback(
		(e?: React.MouseEvent) => {
			e?.stopPropagation();
			setWindows(prev =>
				prev.map(w => (w.id === id ? { ...w, isMaximized: !isMaximized } : w)),
			);
		},
		[id, isMaximized, setWindows],
	);

	// Snap Preview State
	const [snapPhantom, setSnapPhantom] = useState<null | 'left' | 'right' | 'top'>(null);

	const handleDragCallback = (e: any, d: any) => {
		if (!d.node.offsetParent) return;
		const pointerX = e.clientX || (e.touches && e.touches[0]?.clientX);
		const pointerY = e.clientY || (e.touches && e.touches[0]?.clientY);

		if (pointerY < 60) {
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
			setWindows(prev =>
				prev.map(w => (w.id === id ? { ...w, position: { x: d.x, y: d.y } } : w)),
			);
		}
		setSnapPhantom(null);
	};

	const handleResizeStop: RndResizeStopCallback = (e, direction, ref, delta, position) => {
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
										'top-4 bottom-4 right-4 left-[calc(50%+0.5rem)]',
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
						className={cn(isMaximized && 'pointer-events-none')}
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
								pointerEvents: 'auto',
								position: isMaximized ? 'relative' : 'absolute',
							}}
							className={cn(
								'flex flex-col overflow-hidden transition-all duration-300 rounded-lg',
								isActive
									? 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_-10px_rgba(0,0,0,0.5)]'
									: 'shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_10px_30px_-5px_rgba(0,0,0,0.3)] opacity-90 grayscale-[0.2]',
							)}
							onMouseDown={handleFocus}
							dragHandleClassName="window-drag-handle"
						>
							{/* Title Bar */}
							<div
								className={cn(
									'h-9 flex items-center justify-between px-3 shrink-0 select-none relative z-50 window-drag-handle cursor-default backdrop-blur-xl border-b border-white/5',
									isActive ? 'bg-background/80' : 'bg-background/60',
								)}
								onDoubleClick={handleMaximize}
							>
								{/* Window Controls */}
								<div className="flex items-center gap-4">
									<WindowControls
										onClose={handleClose}
										onMinimize={handleMinimize}
										onMaximize={handleMaximize}
									/>

									<div className="h-4 w-px bg-white/10" aria-hidden="true" />

									<span
										className={cn(
											'text-xs font-medium tracking-wide flex items-center gap-2 transition-colors',
											isActive ? 'text-foreground' : 'text-muted-foreground',
										)}
									>
										{title}
									</span>
								</div>
							</div>

							{/* Content Background */}
							<div className="grow overflow-auto bg-background/40 backdrop-blur-md relative w-full h-full text-foreground">
								{component}
							</div>
						</Rnd>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
});
