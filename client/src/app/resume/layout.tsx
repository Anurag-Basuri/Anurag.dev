import type { ReactNode } from 'react';
import { TopBar } from '@/layout/TopBar';

export const metadata = {
	title: 'Resume Viewer | Anurag.dev',
	description: 'Interactive resume document viewer',
};

export default function ResumeLayout({ children }: { children: ReactNode }) {
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent font-sans text-foreground">
			<TopBar />
			<div className="flex-1 min-h-0 w-full overflow-hidden">{children}</div>
		</div>
	);
}
