import type { ReactNode } from 'react';
import { TopBar } from '@/layout/TopBar';

export const metadata = {
	title: 'System Diagnostics | Anurag.dev',
	description: 'Terminal-style README document reader',
};

export default function ReadmeLayout({ children }: { children: ReactNode }) {
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent font-sans text-foreground">
			<TopBar />
			<div className="flex-1 min-h-0 w-full overflow-hidden">{children}</div>
		</div>
	);
}

