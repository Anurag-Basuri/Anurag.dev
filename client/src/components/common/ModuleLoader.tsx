'use client';

import React from 'react';

export interface ModuleLoaderProps {
	message?: string;
}

export const ModuleLoader = ({ message = 'Loading module...' }: ModuleLoaderProps) => (
	<div className="flex items-center justify-center h-full w-full min-h-[200px]">
		<div className="flex flex-col items-center gap-4">
			<div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
			<div className="text-sm text-emerald-500/60 font-mono tracking-wider animate-pulse uppercase text-[10px]">
				{message}
			</div>
		</div>
	</div>
);
