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
		<div className="h-full flex flex-col bg-gradient-to-br from-background/40 via-background/50 to-background/60 backdrop-blur-sm">
			{/* Tab Bar */}
			<div className="h-10 flex bg-background/70 border-b border-white/10 overflow-hidden shadow-sm">
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
											'h-10 px-4 flex items-center gap-2.5 text-xs border-r border-white/10 cursor-pointer select-none min-w-[140px] max-w-[220px] group relative transition-colors',
											activeWindowId === window.id
												? 'bg-gradient-to-b from-cyan-500/15 to-blue-500/10 text-cyan-300 border-t-2 border-t-cyan-500 shadow-inner'
												: 'bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'
										)}
									>
										<span className="truncate flex-1 font-medium">{window.title}</span>
										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											onClick={e => handleClose(window.id, e)}
											className={cn(
												'p-1 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity',
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
								<Terminal className="w-24 h-24 text-cyan-500/30" />
								<Sparkles className="w-6 h-6 text-cyan-400 absolute -top-2 -right-2 animate-pulse" />
							</motion.div>
							<p className="text-lg font-medium text-white/40 mb-2">No file open</p>
							<p className="text-sm text-white/30">Select a file from the Explorer to get started</p>
							<div className="mt-8 flex flex-col gap-2 text-xs text-white/20">
								<p className="flex items-center gap-2">
									<kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Ctrl</kbd>
									+
									<kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">P</kbd>
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
