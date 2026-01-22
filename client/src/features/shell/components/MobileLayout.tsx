'use client';

import type { ReactNode } from 'react';

const panel = 'rounded-xl bg-card/50 backdrop-blur-md border border-border/30 shadow-md';

export function MobileLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-full w-full pb-[env(safe-area-inset-bottom)]">
			<div className={`${panel} h-full w-full overflow-auto`}>{children}</div>
		</div>
	);
}
