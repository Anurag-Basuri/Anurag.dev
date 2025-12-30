'use client';

import { cn } from '@/lib/utils';

export interface LoaderProps {
	/** Height class for the loader container */
	height?: string;
	/** Message to display below the spinner */
	message?: string;
	/** Whether to show the message */
	showMessage?: boolean;
}

/**
 * Unified loader component for dynamic imports and loading states
 * Use for Suspense fallbacks and async content loading
 */
export function Loader({
	height = 'h-full',
	message = 'Loading...',
	showMessage = false,
}: LoaderProps) {
	return (
		<div
			className={cn(
				'w-full flex items-center justify-center',
				height,
				showMessage ? 'min-h-[200px]' : '',
			)}
		>
			<div className="flex flex-col items-center gap-4">
				<div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
				{showMessage && (
					<div className="text-[10px] text-emerald-500/60 font-mono tracking-wider uppercase animate-pulse">
						{message}
					</div>
				)}
			</div>
		</div>
	);
}

// Backward compatible alias
export const ModuleLoader = ({ message = 'Loading module...' }: { message?: string }) => (
	<Loader height="h-full" message={message} showMessage />
);
