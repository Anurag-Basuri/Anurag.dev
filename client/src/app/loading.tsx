import React from 'react';

export default function RootLoading() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				{/* Spinner */}
				<div
					className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"
					style={{ boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}
					aria-label="Loading"
				/>
				{/* Text */}
				<div className="text-xs text-emerald-500/60 font-mono tracking-wider uppercase animate-pulse">
					Loading...
				</div>
			</div>
		</div>
	);
}
