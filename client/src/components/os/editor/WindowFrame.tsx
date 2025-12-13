import { useAtom, useSetAtom } from 'jotai';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
						className={cn('bg-transparent overflow-hidden flex flex-col')}
						onMouseDown={handleFocus}
					>
						{/* Title Bar - Minimalist and Transparent */}
						<div
							className={cn(
								'h-9 flex items-center justify-between px-4 shrink-0 transition-colors select-none',
								'bg-black/40 backdrop-blur-md border-b border-white/5',
							)}
						>
							<span className="text-[13px] font-medium tracking-wide text-white/80 flex items-center gap-2">
								{title}
							</span>
							<div className="flex items-center gap-1.5">
								<button
									onClick={handleMinimize}
									className="group/min w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
									title="Minimize"
								>
									<Minus size={14} className="text-white/40 group-hover/min:text-white transition-colors" />
								</button>
								<button
									onClick={handleClose}
									className="group/close w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/20 transition-colors"
									title="Close"
								>
									<X size={14} className="text-white/40 group-hover/close:text-red-400 transition-colors" />
								</button>
							</div>
						</div>
						{/* Content */}
						<div className="grow overflow-auto bg-transparent relative w-full h-full">
							{component}
						</div>
					</Rnd>
				</motion.div>
			)}
		</AnimatePresence>
	);
});
