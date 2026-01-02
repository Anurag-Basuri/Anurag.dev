'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PANEL_STYLES } from '../constants';

interface MobileLayoutProps {
	children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
	return (
		<div className="h-full w-full flex flex-col p-1">
			<div className={cn(PANEL_STYLES.base, PANEL_STYLES.mobile, 'h-full w-full')}>
				{children}
			</div>
		</div>
	);
}
