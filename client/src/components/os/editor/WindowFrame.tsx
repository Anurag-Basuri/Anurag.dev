import { useAtom, useSetAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, memo } from 'react';
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
		<AnimatePresence mode="wait">
			{!isMinimized && (
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
				>
					<Rnd
						{...maximizedProps}
						onDragStart={handleFocus}
						style={{ width: '100%', height: '100%' }}
						className={cn(
							'flex flex-col overflow-hidden transition-shadow duration-300',
							// Active State Visuals: Glow and Border
							isActive
								? 'shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_20px_60px_-10px_rgba(0,0,0,0.6)]'
								: 'shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_10px_30px_-5px_rgba(0,0,0,0.4)] opacity-90',
						)}
						onMouseDown={handleFocus}
					>
						{/* Title Bar - Premium Glassmorphism */}
						<div
							className={cn(
								'h-10 flex items-center justify-between px-4 shrink-0 transition-colors select-none relative z-50',
								'bg-card/40 backdrop-blur-xl border-b border-border/10',
								isActive ? 'bg-card/60' : 'bg-card/20',
							)}
						>
							{/* Drag Handle Area */}
							<div className="absolute inset-0 w-full h-full" />

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
							<div className="flex items-center gap-2 relative z-10">
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
						{/* Content Background to prevent bleed */}
						<div className="grow overflow-auto bg-background/95 backdrop-blur-md relative w-full h-full">
							{component}
						</div>
					</Rnd>
				</motion.div>
			)}
		</AnimatePresence>
	);
});
