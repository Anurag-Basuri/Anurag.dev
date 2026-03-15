'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';

const Sidebar = dynamic(
	() => import('@/features/sidebar/components/Sidebar').then(m => m.Sidebar),
	{
		ssr: false,
		loading: () => <div className="w-64 lg:w-72 shrink-0 animate-pulse bg-muted" />,
	},
);

function TopBar() {
	return (
		<header className="h-12 w-full bg-background/90 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 shrink-0 z-50">
			<div className="flex items-center gap-2">
				<Menu className="w-5 h-5 text-muted-foreground md:hidden" />
				<div className="flex gap-1.5 items-center bg-muted/30 px-2 py-1 rounded-sm border border-border/50">
					<div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
					<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
				</div>
				<span className="text-sm font-semibold tracking-wide ml-2">anurag-os</span>
			</div>
			<div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
				<button
					onClick={() => {
						window.dispatchEvent(
							new CustomEvent('scroll-to-section', {
								detail: { sectionId: 'contact' },
							}),
						);
					}}
					className="hover:text-foreground transition-colors"
				>
					Contact
				</button>
			</div>
		</header>
	);
}

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary>
			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground">
					{/* TopBar Area */}
					<TopBar />

					{/* Main UI */}
					<div className="flex-1 flex min-h-0 w-full overflow-hidden p-2 md:p-3 gap-2">
						{/* Sidebar Area */}
						<aside className="hidden md:flex rounded-xl bg-transparent border border-border/20 w-64 lg:w-72 shrink-0 overflow-hidden">
							<ErrorBoundary>
								<Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/20" />}>
									<Sidebar />
								</Suspense>
							</ErrorBoundary>
						</aside>

						{/* Editor Area (Scroll Container) */}
						<main className="rounded-xl bg-transparent border border-border/20 flex-1 min-h-0 overflow-hidden relative">
							<ErrorBoundary>
								<Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/20" />}>
									{children}
								</Suspense>
							</ErrorBoundary>
						</main>
					</div>

					<Toaster
						position="top-right"
						toastOptions={{
							duration: 3000,
							className: '!bg-background !text-foreground !border !border-border/50',
						}}
					/>
				</div>
			</ContextMenuProvider>
		</ErrorBoundary>
	);
}
