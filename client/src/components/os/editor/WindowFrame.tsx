import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { WindowState } from '@/types/window';
import { activeWindowIdAtom, windowStackAtom } from '@/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { WindowControls } from '@/components/shared/WindowControls';
import { useWindowManager } from '@/hooks/use-window-manager';

interface WindowFrameProps {
	windowState: WindowState;
	bounds?: string; // Kept via type but unused
}

export const WindowFrame = memo(function WindowFrame({ windowState }: WindowFrameProps) {
	// Atoms: Read-only mostly here, actions via hook
	const activeWindowId = useAtomValue(activeWindowIdAtom);
	const windowStack = useAtomValue(windowStackAtom);

	// Actions
	const { closeWindow, minimizeWindow, focusWindow } = useWindowManager();

	const { id, title, component, isMinimized } = windowState;

	const zIndex = windowStack.indexOf(id) + 10;
	const isActive = activeWindowId === id;

	const handleFocus = () => {
		if (!isActive) focusWindow(id);
	};

	return (
		<AnimatePresence mode="wait">
			{!isMinimized && (
				<motion.div
					key={id}
					initial={{ opacity: 0, scale: 0.98, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.98, y: 10 }}
					transition={{
						duration: 0.25,
						ease: [0.2, 0.6, 0.2, 1], // Standard comfortable spring-like ease
					}}
					style={{ zIndex }}
					className={cn(
						'absolute inset-0 flex flex-col overflow-hidden bg-background/90 backdrop-blur-2xl',
						'shadow-2xl',
						// Subtle highlight for active window (though full screen, good for transitions)
						isActive ? 'z-50' : 'z-40 grayscale-[0.3]',
					)}
					onMouseDown={handleFocus}
				>
					{/* Title Bar */}
					<div
						className={cn(
							'h-9 flex items-center justify-between px-3 shrink-0 select-none relative z-50 cursor-default border-b border-white/5 transition-colors duration-200',
							isActive ? 'bg-white/5' : 'bg-transparent',
						)}
					>
						{/* Window Controls */}
						<div className="flex items-center gap-4">
							<WindowControls
								onClose={() => closeWindow(id)}
								onMinimize={() => minimizeWindow(id)}
								// maximize is disabled/hidden
							/>

							<div className="h-4 w-px bg-white/10" aria-hidden="true" />

							<span
								className={cn(
									'text-xs font-medium tracking-wide flex items-center gap-2 transition-colors duration-200',
									isActive ? 'text-foreground' : 'text-muted-foreground',
								)}
							>
								{/* Activity Dot */}
								<div
									className={cn(
										'w-1.5 h-1.5 rounded-full transition-colors duration-200',
										isActive
											? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
											: 'bg-muted-foreground/30',
									)}
								/>
								{title}
							</span>
						</div>
					</div>

					{/* Content Background */}
					<div className="grow overflow-auto relative w-full h-full text-foreground mobile-friendly-scroll bg-background/50">
						{component}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
});
