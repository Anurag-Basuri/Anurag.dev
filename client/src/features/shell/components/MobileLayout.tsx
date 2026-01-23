'use client';

import type { ReactNode } from 'react';

const panel = 'rounded-xl bg-transparent border border-border/20';

export function MobileLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-full w-full pb-[env(safe-area-inset-bottom)]">
			<div className={`${panel} h-full w-full overflow-auto`}>{children}</div>
		</div>
	);
}
