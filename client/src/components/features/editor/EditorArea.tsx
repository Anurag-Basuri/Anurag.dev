'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { X, Terminal, Sparkles, Plus, Clock, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileIcon, getLanguage } from '@/lib/editorUtils';
import { Breadcrumbs } from '@/components/features/editor/Breadcrumbs';
import { StatusBar } from '@/components/features/editor/StatusBar';
import { initialFileSystem, FileSystemItem } from '@/lib/data';

import React from 'react';

export function EditorArea() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);

	const activeWindow = windows.find(w => w.id === activeWindowId);

	// Helper to open a file from empty state
	const handleQuickOpen = (id: string, name: string) => {
		setWindows(prev => {
			if (prev.find(w => w.id === id)) {
				setActiveWindowId(id);
				return prev;
			}

			return prev;
		});
	};

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

	// Get active file language
	const currentLanguage = activeWindow ? getLanguage(activeWindow.id) : 'Plain Text';

	return (
		<div className="h-full flex flex-col bg-background/50 backdrop-blur-sm transition-colors duration-300">
			{/* Tab Bar */}
			<div className="h-9 flex bg-muted/20 border-b border-border/40 overflow-hidden shadow-sm backdrop-blur-md select-none">
				<ScrollAreaPrimitive.Root className="w-full relative overflow-hidden">
					<ScrollAreaPrimitive.Viewport className="w-full h-full rounded-[inherit]">
						<div className="flex h-9 items-end px-1 gap-1">
							<AnimatePresence mode="popLayout">
								{windows.map(window => {
									const FileIcon = getFileIcon(window.id);
									const isActive = activeWindowId === window.id;

									return (
										<motion.div
											key={window.id}
											layout
											initial={{ opacity: 0, width: 0, scale: 0.9 }}
											animate={{ opacity: 1, width: 'auto', scale: 1 }}
											exit={{ opacity: 0, width: 0, scale: 0.9 }}
											transition={{ duration: 0.15 }}
											onClick={() => setActiveWindowId(window.id)}
											className={cn(
												'h-8 px-3 flex items-center gap-2 text-[11px] cursor-pointer min-w-[120px] max-w-[200px] group relative transition-all duration-200 rounded-t-sm border-t border-x border-transparent',
												isActive
													? 'bg-background text-foreground font-medium border-border/40 shadow-sm relative z-10'
													: 'bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground',
											)}
										>
											{/* Active Indicator Top Line */}
											{isActive && (
												<div className="absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
											)}

											<FileIcon className="w-3.5 h-3.5 opacity-70 shrink-0" />
											<span className="truncate flex-1">{window.title}</span>

											<motion.button
												whileHover={{
													scale: 1.2,
													backgroundColor: 'rgba(var(--foreground), 0.1)',
												}}
												whileTap={{ scale: 0.9 }}
												onClick={e => handleClose(window.id, e)}
												className={cn(
													'p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-1',
													isActive && 'opacity-100', // Always show close on active
												)}
												aria-label={`Close ${window.title}`}
											>
												<X className="w-3 h-3" />
											</motion.button>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					</ScrollAreaPrimitive.Viewport>
					<ScrollBar orientation="horizontal" className="h-2" />
				</ScrollAreaPrimitive.Root>
			</div>

			{/* Breadcrumbs - Only show if active window exists */}
			{activeWindow && <Breadcrumbs path={activeWindow.id} />}

			{/* Content Area */}
			<div className="flex-1 overflow-hidden relative group/editor">
				<AnimatePresence mode="wait">
					{activeWindow ? (
						<motion.div
							key={activeWindow.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="h-full w-full overflow-auto p-4 md:p-6"
						>
							{activeWindow.component}
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none p-8"
						>
							<motion.div
								animate={{
									y: [0, -10, 0],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
								className="relative mb-8"
							>
								<div className="w-24 h-24 rounded-2xl bg-linear-to-tr from-primary/20 to-secondary/20 flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl">
									<Terminal className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
								</div>
								<Sparkles className="w-6 h-6 text-yellow-400 absolute -top-4 -right-4 animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
							</motion.div>

							<h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">
								AnuragOS Editor
							</h2>
							<p className="text-sm text-muted-foreground/60 max-w-md text-center mb-8">
								Select a file from the explorer to start editing, or use the quick
								access shortcuts below.
							</p>

							<div className="grid grid-cols-2 gap-3 w-full max-w-sm">
								<button className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/80 transition-all text-left group">
									<div className="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
										<File className="w-4 h-4" />
									</div>
									<div className="flex flex-col">
										<span className="text-xs font-medium text-foreground">
											Open File
										</span>
										<span className="text-[10px] text-muted-foreground">
											Ctrl+O
										</span>
									</div>
								</button>
								<button className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/80 transition-all text-left group">
									<div className="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
										<Clock className="w-4 h-4" />
									</div>
									<div className="flex flex-col">
										<span className="text-xs font-medium text-foreground">
											Recent
										</span>
										<span className="text-[10px] text-muted-foreground">
											Ctrl+R
										</span>
									</div>
								</button>
							</div>

							<div className="mt-8 flex flex-col gap-2 text-xs text-muted-foreground/40">
								<p className="items-center gap-2 md:flex hidden">
									<kbd className="px-2 py-1 bg-muted/50 rounded border border-border/50 shadow-sm text-xs font-mono">
										Ctrl
									</kbd>
									+
									<kbd className="px-2 py-1 bg-muted/50 rounded border border-border/50 shadow-sm text-xs font-mono">
										P
									</kbd>
									<span>to search files</span>
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Status Bar */}
			<StatusBar language={currentLanguage} />
		</div>
	);
}
