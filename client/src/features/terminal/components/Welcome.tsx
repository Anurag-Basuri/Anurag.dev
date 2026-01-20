'use client';

import { memo } from 'react';

export const Welcome = memo(function Welcome() {
	return (
		<div className="text-xs font-mono space-y-3 animate-in fade-in duration-700">
			<div className="flex items-center gap-2">
				<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
				<p className="text-muted-foreground">
					Welcome! Type <span className="text-primary font-semibold">help</span> for
					available commands.
				</p>
			</div>
			<div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground/50">
				<kbd className="px-1.5 py-0.5 bg-muted/50 rounded border border-border/50">
					<span className="text-primary/70">↑↓</span> History
				</kbd>
				<kbd className="px-1.5 py-0.5 bg-muted/50 rounded border border-border/50">
					<span className="text-primary/70">Tab</span> Complete
				</kbd>
				<kbd className="px-1.5 py-0.5 bg-muted/50 rounded border border-border/50">
					<span className="text-primary/70">Ctrl+L</span> Clear
				</kbd>
			</div>
		</div>
	);
});
