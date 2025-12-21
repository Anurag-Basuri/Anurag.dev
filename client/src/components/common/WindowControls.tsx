'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2, ChevronsUpDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Standard MacOS Colors
const COLORS = {
	close: {
		bg: '#ff5f57',
		hover: '#ff6961',
		icon: '#990000',
	},
	minimize: {
		bg: '#febc2e',
		hover: '#ffc940',
		icon: '#985700',
	},
	maximize: {
		bg: '#28c840',
		hover: '#35d14b',
		icon: '#006500',
	},
} as const;

export interface WindowControlsProps {
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;

	// Optional overrides for specific behaviors
	minimizeIcon?: React.ElementType<{ className?: string; style?: React.CSSProperties }>;
	maximizeIcon?: React.ElementType<{ className?: string; style?: React.CSSProperties }>;
	closeLabel?: string;
	maximizeLabel?: string;
	minimizeLabel?: string;
	className?: string;
}

export function WindowControls({
	onClose,
	onMinimize,
	onMaximize,
	isMaximized = false,
	minimizeIcon: CustomMinimizeIcon,
	maximizeIcon: CustomMaximizeIcon,
	closeLabel = 'Close',
	minimizeLabel = 'Minimize',
	maximizeLabel = 'Fullscreen',
	className,
}: WindowControlsProps) {
	// Determine icons based on state and props
	const MinIcon = CustomMinimizeIcon || Minus;
	const MaxIcon = CustomMaximizeIcon || (isMaximized ? Minimize2 : Maximize2);
	const maxLabel = isMaximized ? 'Restore' : maximizeLabel;

	return (
		<TooltipProvider delayDuration={300}>
			<div className={cn('flex items-center gap-1.5 group', className)}>
				{/* Close Button (Red) */}
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.15 }}
							whileTap={{ scale: 0.95 }}
							onClick={onClose}
							className="relative w-3 h-3 rounded-full flex items-center justify-center group/btn shadow-sm transition-colors"
							style={{ backgroundColor: COLORS.close.bg }}
							aria-label={closeLabel}
						>
							<div
								className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
								style={{ backgroundColor: COLORS.close.hover }}
							/>
							<div className="absolute -inset-2" /> {/* Hit area */}
							<X
								className="w-2 h-2 relative z-10 opacity-0 group-hover/btn:opacity-100 transition-opacity"
								style={{ color: COLORS.close.icon }}
							/>
						</motion.button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>{closeLabel}</p>
					</TooltipContent>
				</Tooltip>

				{/* Minimize/Action Button (Yellow) */}
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.15 }}
							whileTap={{ scale: 0.95 }}
							onClick={onMinimize}
							className="relative w-3 h-3 rounded-full flex items-center justify-center group/btn shadow-sm transition-colors"
							style={{ backgroundColor: COLORS.minimize.bg }}
							aria-label={minimizeLabel}
						>
							<div
								className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
								style={{ backgroundColor: COLORS.minimize.hover }}
							/>
							<div className="absolute -inset-2" />
							<MinIcon
								className="w-2 h-2 relative z-10 opacity-0 group-hover/btn:opacity-100 transition-opacity"
								style={{ color: COLORS.minimize.icon }}
							/>
						</motion.button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>{minimizeLabel}</p>
					</TooltipContent>
				</Tooltip>

				{/* Maximize Button (Green) */}
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.15 }}
							whileTap={{ scale: 0.95 }}
							onClick={onMaximize}
							className="relative w-3 h-3 rounded-full flex items-center justify-center group/btn shadow-sm transition-colors"
							style={{ backgroundColor: COLORS.maximize.bg }}
							aria-label={maxLabel}
						>
							<div
								className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
								style={{ backgroundColor: COLORS.maximize.hover }}
							/>
							<div className="absolute -inset-2" />
							<MaxIcon
								className="w-2 h-2 relative z-10 opacity-0 group-hover/btn:opacity-100 transition-opacity"
								style={{ color: COLORS.maximize.icon }}
							/>
						</motion.button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>{maxLabel}</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}

// Export pre-configured variants for common use cases
export const SidebarControls = ({
	onClose,
	onToggleFolders,
	onMaximize,
}: {
	onClose?: () => void;
	onToggleFolders?: () => void;
	onMaximize?: () => void;
}) => (
	<WindowControls
		onClose={onClose}
		onMinimize={onToggleFolders}
		onMaximize={onMaximize}
		minimizeIcon={ChevronsUpDown}
		minimizeLabel="Toggle All Folders"
	/>
);

export const TerminalControls = ({
	onClose,
	onClearHistory,
	onMaximize,
}: {
	onClose?: () => void;
	onClearHistory?: () => void;
	onMaximize?: () => void;
}) => (
	<WindowControls
		onClose={onClose}
		onMinimize={onClearHistory}
		onMaximize={onMaximize}
		minimizeIcon={Trash2}
		minimizeLabel="Clear History"
	/>
);

export const ModuleControls = ({
	onClose,
	onMinimize,
	onMaximize,
	isMaximized = false,
}: {
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
}) => (
	<WindowControls
		onClose={onClose}
		onMinimize={onMinimize}
		onMaximize={onMaximize}
		isMaximized={isMaximized}
	/>
);
