'use client';

import { memo } from 'react';

interface BootProgressProps {
	status: string;
	progress: number;
}

// Displays boot status text and animated progress bar.
export const BootProgress = memo(function BootProgress({ status, progress }: BootProgressProps) {
	return (
		<div className="w-full max-w-xs space-y-4">
			{/* Status and Percentage */}
			<div className="flex justify-between text-[11px] font-bold tracking-[0.15em] text-emerald-500/60 uppercase font-mono">
				<span className="w-32 text-left truncate">{status}</span>
				<span>{progress}%</span>
			</div>

			{/* Progress Bar */}
			<div className="h-1 w-full bg-emerald-950/50 rounded-full overflow-hidden border border-emerald-500/10">
				<div
					className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-100 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
});
