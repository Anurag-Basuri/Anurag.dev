'use client';

import { memo } from 'react';

interface BootProgressProps {
	progress: number;
}

// Thin, silent progress line — no status text, no percentage. Just a clean accent-colored fill.
export const BootProgress = memo(function BootProgress({ progress }: BootProgressProps) {
	return (
		<div className="w-full max-w-50 mx-auto">
			<div className="h-0.5 w-full bg-white/6 rounded-full overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-100 ease-out"
					style={{
						width: `${progress}%`,
						background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.5))',
						boxShadow: '0 0 12px rgba(255,255,255,0.15)',
					}}
				/>
			</div>
		</div>
	);
});
