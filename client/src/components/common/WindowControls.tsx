'use client';

import React from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WindowControlsProps {
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	isMaximized?: boolean;
	className?: string;
}

export function WindowControls({
	onClose,
	onMinimize,
	onMaximize,
	isMaximized,
	className,
}: WindowControlsProps) {
	return (
		<div className={cn('flex items-center gap-2', className)}>
			{/* Close (Red) */}
			<button
				onClick={onClose}
				className="group relative w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center hover:bg-[#FF5F56]/80 transition-colors"
				aria-label="Close"
			>
				<X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
			</button>

			{/* Minimize (Yellow) */}
			<button
				onClick={onMinimize}
				className="group relative w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center hover:bg-[#FFBD2E]/80 transition-colors"
				aria-label="Minimize"
			>
				<Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
			</button>

			{/* Maximize (Green) */}
			<button
				onClick={onMaximize}
				className="group relative w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center hover:bg-[#27C93F]/80 transition-colors"
				aria-label={isMaximized ? 'Restore' : 'Maximize'}
			>
				{isMaximized ? (
					<MinimizeIcon className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
				) : (
					<MaximizeIcon className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
				)}
			</button>
		</div>
	);
}

// Helper icons
const MaximizeIcon = ({ className }: { className?: string }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="4"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="15 3 21 3 21 9" />
		<polyline points="9 21 3 21 3 15" />
		<line x1="21" y1="3" x2="14" y2="10" />
		<line x1="3" y1="21" x2="10" y2="14" />
	</svg>
);

const MinimizeIcon = ({ className }: { className?: string }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="4"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
	</svg>
);
