'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavRailProps {
	sidebarCollapsed: boolean;
	terminalCollapsed: boolean;
	onToggleSidebar: () => void;
	onToggleTerminal: () => void;
}

export function NavRail({
	sidebarCollapsed,
	terminalCollapsed,
	onToggleSidebar,
	onToggleTerminal,
}: NavRailProps) {
	return (
		<div className="w-12 h-full flex flex-col items-center py-4 gap-4 bg-black/20 border-r border-white/5 relative z-20">
			{/* Sidebar Indicator */}
			<RailIndicator
				isActive={sidebarCollapsed}
				onClick={onToggleSidebar}
				label="Sidebar"
				shortcut="Ctrl+B"
			/>

			{/* Terminal Indicator */}
			<RailIndicator
				isActive={terminalCollapsed}
				onClick={onToggleTerminal}
				label="Terminal"
				shortcut="Ctrl+`"
			/>
		</div>
	);
}

function RailIndicator({
	isActive,
	onClick,
	label,
	shortcut,
}: {
	isActive: boolean;
	onClick: () => void;
	label: string;
	shortcut: string;
}) {
	return (
		<button
			onClick={onClick}
			className="w-full h-32 flex items-center justify-center group relative cursor-pointer outline-none"
			title={`Toggle ${label} (${shortcut})`}
		>
			<motion.div
				animate={{
					height: isActive ? 60 : 20,
					backgroundColor: isActive
						? 'rgba(52, 211, 153, 0.4)'
						: 'rgba(255, 255, 255, 0.1)',
					width: isActive ? 3 : 2,
				}}
				className={cn(
					'rounded-full transition-all duration-300',
					isActive
						? 'group-hover:bg-emerald-400 group-hover:h-20 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)]'
						: 'group-hover:bg-white/30',
				)}
			/>

			{/* Tooltip or Label could go here */}
		</button>
	);
}
