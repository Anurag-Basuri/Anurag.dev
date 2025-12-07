'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { X, Terminal, Sparkles, File, FolderOpen, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileIcon, getLanguage } from '@/lib/editorUtils';
import { Breadcrumbs } from '@/components/features/editor/Breadcrumbs';
import { StatusBar } from '@/components/features/editor/StatusBar';
import { getModuleComponent } from '@/lib/moduleRegistry';
import React from 'react';

export function EditorArea() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);

	const activeWindow = windows.find(w => w.id === activeWindowId);

	const openModule = (id: string, title: string) => {
		setWindows(prev => {
			if (prev.find(w => w.id === id)) {
				setActiveWindowId(id);
				return prev;
			}
			setActiveWindowId(id);
			return [
				...prev,
				{
					id,
					title: title.toUpperCase(),
					component: getModuleComponent(id),
					isOpen: true,
					isMinimized: false,
				},
			];
		});
	};

	const handleClose = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const newWindows = windows.filter(w => w.id !== id);
		setWindows(newWindows);

		if (activeWindowId === id) {
			if (newWindows.length > 0) {
				setActiveWindowId(newWindows[newWindows.length - 1].id);
			} else {
				setActiveWindowId(null);
			}
		}
	};

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
													isActive && 'opacity-100',
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

			{/* Breadcrumbs */}
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
							{/* Hero Icon */}
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
								className="relative mb-6"
							>
								<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center backdrop-blur-xl border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.15)]">
									<Code2 className="w-10 h-10 text-primary" />
								</div>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
									className="absolute -inset-3 rounded-3xl border border-dashed border-primary/20"
								/>
							</motion.div>

							<h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
								Welcome to AnuragOS
							</h2>
							<p className="text-sm text-muted-foreground/70 max-w-sm text-center mb-8">
								Explore my portfolio by selecting a section below or navigating the
								file explorer.
							</p>

							{/* Quick Access Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
								<motion.button
									whileHover={{ scale: 1.02, y: -2 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => openModule('about', 'About')}
									className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/5 to-transparent hover:from-emerald-500/10 hover:border-emerald-500/30 transition-all group"
								>
									<div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
										<Sparkles className="w-5 h-5" />
									</div>
									<span className="text-sm font-medium text-foreground">
										About Me
									</span>
									<span className="text-[10px] text-muted-foreground">
										whoami.md
									</span>
								</motion.button>

								<motion.button
									whileHover={{ scale: 1.02, y: -2 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => openModule('projects', 'Projects')}
									className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/5 to-transparent hover:from-blue-500/10 hover:border-blue-500/30 transition-all group"
								>
									<div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
										<FolderOpen className="w-5 h-5" />
									</div>
									<span className="text-sm font-medium text-foreground">
										Projects
									</span>
									<span className="text-[10px] text-muted-foreground">
										all-projects.json
									</span>
								</motion.button>

								<motion.button
									whileHover={{ scale: 1.02, y: -2 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => openModule('contact', 'Contact')}
									className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/5 to-transparent hover:from-purple-500/10 hover:border-purple-500/30 transition-all group"
								>
									<div className="p-3 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
										<Terminal className="w-5 h-5" />
									</div>
									<span className="text-sm font-medium text-foreground">
										Contact
									</span>
									<span className="text-[10px] text-muted-foreground">
										email.txt
									</span>
								</motion.button>
							</div>

							{/* Hint */}
							<div className="mt-10 hidden md:flex items-center gap-3 text-xs text-muted-foreground/50">
								<span>Use the terminal below or click files in the explorer</span>
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
