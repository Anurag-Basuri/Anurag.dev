'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { X, Terminal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

export function EditorArea() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);

	const activeWindow = windows.find(w => w.id === activeWindowId);

	const handleClose = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const newWindows = windows.filter(w => w.id !== id);
		setWindows(newWindows);

		if (activeWindowId === id) {
			// If closing active window, activate the last one if available
			if (newWindows.length > 0) {
				setActiveWindowId(newWindows[newWindows.length - 1].id);
			} else {
				setActiveWindowId(null);
			}
		}
	};

	return (
		<div className="h-full flex flex-col bg-background/50 backdrop-blur-sm transition-colors duration-300">
			{/* Tab Bar */}
			<div className="h-10 flex bg-background/80 border-b border-border overflow-hidden shadow-sm">
				<ScrollAreaPrimitive.Root className="w-full relative overflow-hidden">
					<ScrollAreaPrimitive.Viewport className="w-full h-full rounded-[inherit]">
						<div className="flex h-10">
							<AnimatePresence mode="popLayout">
								{windows.map(window => (
									<motion.div
										key={window.id}
										layout
										initial={{ opacity: 0, width: 0 }}
										animate={{ opacity: 1, width: 'auto' }}
										exit={{ opacity: 0, width: 0 }}
										transition={{ duration: 0.2 }}
										onClick={() => setActiveWindowId(window.id)}
										className={cn(
											'h-10 px-4 flex items-center gap-2.5 text-xs border-r border-border cursor-pointer select-none min-w-[140px] max-w-[220px] group relative transition-all duration-200',
											activeWindowId === window.id
												? 'bg-muted text-primary border-t-2 border-t-primary shadow-inner font-medium'
												: 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
										)}
									>
										<span className="truncate flex-1">{window.title}</span>
										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											onClick={e => handleClose(window.id, e)}
											className={cn(
												'p-1 rounded hover:bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity',
												activeWindowId === window.id && 'opacity-100'
											)}
											aria-label={`Close ${window.title}`}
										>
											<X className="w-3.5 h-3.5" />
										</motion.button>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</ScrollAreaPrimitive.Viewport>
					<ScrollBar orientation="horizontal" className="h-2" />
				</ScrollAreaPrimitive.Root>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-hidden relative">
				<AnimatePresence mode="wait">
					{activeWindow ? (
						<motion.div
							key={activeWindow.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="h-full w-full overflow-auto p-4 md:p-6"
						>
							{activeWindow.component}
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none p-8"
						>
							<motion.div
								animate={{ 
									rotate: [0, 5, -5, 0],
									scale: [1, 1.05, 1]
								}}
								transition={{ 
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut"
								}}
								className="relative mb-6"
							>
								<Terminal className="w-24 h-24 text-primary/20" />
								<Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
							</motion.div>
							<p className="text-lg font-medium text-muted-foreground mb-2">No file open</p>
							<p className="text-sm text-muted-foreground/60">Select a file from the Explorer to get started</p>
							<div className="mt-8 flex flex-col gap-2 text-xs text-muted-foreground/40">
								<p className="flex items-center gap-2">
									<kbd className="px-2 py-1 bg-muted rounded border border-border">Ctrl</kbd>
									+
									<kbd className="px-2 py-1 bg-muted rounded border border-border">P</kbd>
									<span>Quick Open</span>
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
