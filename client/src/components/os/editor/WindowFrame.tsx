import { useAtom, useSetAtom } from 'jotai';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowsAtom, windowStackAtom } from '@/store/atoms';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, memo, useCallback } from 'react';
import { WindowControls } from '@/components/shared/WindowControls';

interface WindowFrameProps {
	windowState: WindowState;
	bounds: string; // Kept for compatibility but unused
}

export const WindowFrame = memo(function WindowFrame({ windowState }: WindowFrameProps) {
	const setWindows = useSetAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const { id, title, component, isMinimized } = windowState;

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

	return (
		<AnimatePresence mode="wait">
			{!isMinimized && (
				<motion.div
					key={id}
					initial={{ opacity: 0, scale: 0.98, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.98, y: 10 }}
					transition={{
						duration: 0.2,
						ease: [0.22, 1, 0.36, 1],
					}}
					style={{ zIndex }}
					className={cn(
						'absolute inset-0 flex flex-col overflow-hidden bg-background/90 backdrop-blur-xl',
						// Subtle border for definition against other windows if they were visible (though full screen)
						// Shadow mainly for depth if we add margin later
						'shadow-2xl',
						isActive ? 'z-50' : 'z-40',
					)}
					onMouseDown={handleFocus}
				>
					{/* Title Bar */}
					<div
						className={cn(
							'h-9 flex items-center justify-between px-3 shrink-0 select-none relative z-50 cursor-default border-b border-white/5',
							isActive ? 'bg-white/5' : 'bg-transparent',
						)}
					>
						{/* Window Controls */}
						<div className="flex items-center gap-4">
							<WindowControls
								onClose={handleClose}
								onMinimize={handleMinimize}
								// maximize is disabled/hidden
							/>

							<div className="h-4 w-px bg-white/10" aria-hidden="true" />

							<span
								className={cn(
									'text-xs font-medium tracking-wide flex items-center gap-2 transition-colors',
									isActive ? 'text-foreground' : 'text-muted-foreground',
								)}
							>
								{/* Activity Dot */}
								<div
									className={cn(
										'w-1.5 h-1.5 rounded-full transition-colors',
										isActive ? 'bg-primary' : 'bg-muted-foreground/30',
									)}
								/>
								{title}
							</span>
						</div>
					</div>

					{/* Content Background */}
					<div className="grow overflow-auto relative w-full h-full text-foreground mobile-friendly-scroll">
						{component}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
});
