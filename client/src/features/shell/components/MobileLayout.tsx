'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PANEL_STYLES } from '../constants';

interface MobileLayoutProps {
	children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
	return (
		<div className="h-full w-full flex flex-col px-3 py-2 sm:px-4 sm:py-3 pb-[env(safe-area-inset-bottom)]">
			<div
				className={cn(PANEL_STYLES.base, PANEL_STYLES.mobile, 'h-full w-full rounded-2xl')}
			>
				{children}
			</div>
		</div>
	);
}
