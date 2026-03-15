'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2, ChevronsUpDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PANEL_TOKENS, SPRINGS } from '@/design-system/tokens';

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
	close: { bg: '#ff5f57', hover: '#ff6961', icon: '#990000' },
	minimize: { bg: '#febc2e', hover: '#ffc940', icon: '#985700' },
	maximize: { bg: '#28c840', hover: '#35d14b', icon: '#006500' },
} as const;

type ColorKey = keyof typeof COLORS;

// ============================================================================
// Reusable Control Button Component
// ============================================================================

interface ControlButtonProps {
	colorKey: ColorKey;
	icon: React.ElementType<{ className?: string; style?: React.CSSProperties }>;
	label: string;
	onClick?: () => void;
	disabled?: boolean;
}

const ControlButton = memo(function ControlButton({
	colorKey,
	icon: Icon,
	label,
	onClick,
	disabled = false,
}: ControlButtonProps) {
	const colors = COLORS[colorKey];

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					whileHover={{ scale: 1.15 }}
					whileTap={{ scale: 0.95 }}
					transition={SPRINGS.snappy}
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						onClick?.();
					}}
					disabled={disabled}
					className={cn(
						'relative rounded-full flex items-center justify-center group/btn shadow-sm transition-colors',
						PANEL_TOKENS.control.size,
						disabled && 'opacity-50 cursor-not-allowed',
					)}
					style={{ backgroundColor: colors.bg }}
					aria-label={label}
				>
					{/* Hover overlay */}
					<div
						className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
						style={{ backgroundColor: colors.hover }}
					/>
					{/* Extended hit area */}
					<div className="absolute -inset-2 pointer-events-none" aria-hidden="true" />
					{/* Icon */}
					<Icon
						className={cn(
							PANEL_TOKENS.control.iconSize,
							'relative z-10 opacity-0 group-hover/btn:opacity-100 transition-opacity',
						)}
						style={{ color: colors.icon }}
					/>
				</motion.button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>{label}</p>
			</TooltipContent>
		</Tooltip>
	);
});

// ============================================================================
// Main WindowControls Component
// ============================================================================

export interface WindowControlsProps {
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
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
	const MinIcon = CustomMinimizeIcon ?? Minus;
	const MaxIcon = CustomMaximizeIcon ?? (isMaximized ? Minimize2 : Maximize2);
	const maxLabel = isMaximized ? 'Restore' : maximizeLabel;

	return (
		<TooltipProvider delayDuration={300}>
			<div className={cn('flex items-center', PANEL_TOKENS.control.gap, 'group', className)}>
				<ControlButton
					colorKey="close"
					icon={X}
					label={closeLabel}
					onClick={onClose}
					disabled={!onClose}
				/>
				<ControlButton
					colorKey="minimize"
					icon={MinIcon}
					label={minimizeLabel}
					onClick={onMinimize}
				/>
				<ControlButton
					colorKey="maximize"
					icon={MaxIcon}
					label={maxLabel}
					onClick={onMaximize}
				/>
			</div>
		</TooltipProvider>
	);
}

// ============================================================================
// Pre-configured Control Variants
// ============================================================================

export const SidebarControls = memo(function SidebarControls({
	onClose,
	onToggleFolders,
	onMaximize,
	isMaximized = false,
}: {
	onClose?: () => void;
	onToggleFolders?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
}) {
	return (
		<WindowControls
			onClose={onClose}
			onMinimize={onToggleFolders}
			onMaximize={onMaximize}
			isMaximized={isMaximized}
			minimizeIcon={ChevronsUpDown}
			minimizeLabel="Toggle All Folders"
			maximizeLabel={isMaximized ? 'Restore' : 'Focus Mode'}
		/>
	);
});

export const TerminalControls = memo(function TerminalControls({
	onClose,
	onClearHistory,
	onMaximize,
	isMaximized = false,
}: {
	onClose?: () => void;
	onClearHistory?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
}) {
	return (
		<WindowControls
			onClose={onClose}
			onMinimize={onClearHistory}
			onMaximize={onMaximize}
			isMaximized={isMaximized}
			minimizeIcon={Trash2}
			minimizeLabel="Clear History"
			maximizeLabel={isMaximized ? 'Restore' : 'Focus Mode'}
		/>
	);
});

export const ModuleControls = memo(function ModuleControls({
	onClose,
	onMinimize,
	onMaximize,
	isMaximized = false,
}: {
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
}) {
	return (
		<WindowControls
			onClose={onClose}
			onMinimize={onMinimize}
			onMaximize={onMaximize}
			isMaximized={isMaximized}
		/>
	);
});

