'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WindowControls } from '@/components/common/WindowControls';
import { useAtom } from 'jotai';
import { openFilesAtom } from '@/store';

interface ContentWindowProps {
	title: string;
	moduleId: string;
	children: React.ReactNode;
}

export function ContentWindow({ title, moduleId, children }: ContentWindowProps) {
	const router = useRouter();
	const [openFiles, setOpenFiles] = useAtom(openFilesAtom);
	const [isMaximized, setIsMaximized] = useState(false);

	// Escape key handler to exit fullscreen
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isMaximized) {
				setIsMaximized(false);
			}
		};

		if (isMaximized) {
			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}
	}, [isMaximized]);

	const handleClose = () => {
		const remaining = openFiles.filter(f => f.moduleId !== moduleId);
		setOpenFiles(remaining);

		const target = remaining.length > 0 ? remaining[remaining.length - 1].moduleId : '';
		router.push(target ? `/portfolio/${target}` : '/portfolio');
	};

	const handleMinimize = () => {
		// keep file open, just “desktop”
		router.push('/portfolio');
	};

	const handleMaximize = () => {
		setIsMaximized(!isMaximized);
	};

	return (
		<>
			{/* Fullscreen backdrop */}
			<AnimatePresence>
				{isMaximized && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9998"
						onClick={() => setIsMaximized(false)}
					/>
				)}
			</AnimatePresence>

			<motion.div
				layout
				animate={{
					scale: isMaximized ? 1 : 1,
					opacity: 1,
				}}
				transition={{
					type: 'spring',
					stiffness: 300,
					damping: 30,
				}}
				className={cn(
					'flex flex-col overflow-hidden backdrop-blur-md transition-all duration-300',
					isMaximized
						? 'fixed inset-4 z-9999 rounded-lg shadow-2xl bg-zinc-950 border border-white/10'
						: 'w-full h-full rounded-md border border-white/5 bg-card/80',
				)}
			>
				{/* Header - Standardized to match Sidebar/Terminal */}
				<div className="h-7 flex items-center justify-between px-2 shrink-0 select-none bg-zinc-900/90 border-b border-white/5 backdrop-blur-sm">
					<div className="flex items-center gap-3">
						<WindowControls
							onClose={handleClose}
							onMinimize={handleMinimize}
							onMaximize={handleMaximize}
							isMaximized={isMaximized}
							maximizeLabel="Full Screen"
							minimizeLabel="Minimize"
							closeLabel="Close File"
						/>
						<div className="h-3 w-px bg-white/10" aria-hidden="true" />
						<span className="text-xs font-medium text-muted-foreground tracking-wide">
							{title}
						</span>
					</div>
					{isMaximized && (
						<span className="text-[10px] text-muted-foreground/50 tracking-wider uppercase">
							Press ESC to exit
						</span>
					)}
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-auto relative custom-scrollbar bg-black/20">
					{children}
				</div>
			</motion.div>
		</>
	);
}
