'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WindowControls } from '@/components/common/WindowControls';

interface ContentWindowProps {
	title: string;
	children: React.ReactNode;
}

export function ContentWindow({ title, children }: ContentWindowProps) {
	const router = useRouter();
	const [isMaximized, setIsMaximized] = useState(false);

	const handleClose = () => {
		// Navigate to root (desktop view) to "close" the file
		router.push('/portfolio');
	};

	const handleMinimize = () => {
		// "Minimize" in this context also returns to desktop,
		// but functionally hides the current view.
		router.push('/portfolio');
	};

	const handleMaximize = () => {
		setIsMaximized(!isMaximized);
	};

	return (
		<motion.div
			layout
			className={cn(
				'flex flex-col overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300',
				isMaximized
					? 'fixed inset-0 z-100 w-screen h-screen rounded-none'
					: 'w-full h-full rounded-md border border-white/5',
			)}
		>
			{/* Header - Standardized to match Sidebar/Terminal */}
			<div className="h-7 flex items-center justify-between px-2 shrink-0 select-none bg-zinc-900/90 border-b border-white/5">
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
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-auto relative custom-scrollbar">{children}</div>
		</motion.div>
	);
}
