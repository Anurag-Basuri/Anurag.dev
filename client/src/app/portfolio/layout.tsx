'use client';

import React, { Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { FileSystemItem } from '@/data/filesystem';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { BootGuard } from '@/components/layout/BootGuard';

import dynamic from 'next/dynamic';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <ComponentLoader height="h-32" />,
});
const CollapsedTerminal = dynamic(
	() =>
		import('@/features/terminal/components/CollapsedTerminal').then(
			mod => mod.CollapsedTerminal,
		),
	{ ssr: false },
);
const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});
const Taskbar = dynamic(
	() => import('@/features/shell/components/Taskbar').then(mod => mod.Taskbar),
	{
		ssr: false,
		loading: () => <ComponentLoader height="h-8" />,
	},
);
const TopBar = dynamic(() => import('@/features/shell/components/TopBar').then(mod => mod.TopBar), {
	ssr: false,
	loading: () => <ComponentLoader height="h-8" />,
});

const ComponentLoader = ({ height = 'h-full' }: { height?: string }) => (
	<div className={cn('w-full bg-card/50 animate-pulse flex items-center justify-center', height)}>
		<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
	</div>
);

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();

	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	useKeyboardShortcuts([
		{
			key: 'b',
			ctrl: true,
			handler: () => (sidebar.isCollapsed ? sidebar.expand() : sidebar.collapse()),
			description: 'Toggle sidebar',
		},
		{
			key: '`',
			ctrl: true,
			handler: () => (terminal.isCollapsed ? terminal.expand() : terminal.collapse()),
			description: 'Toggle terminal',
		},
		{
			key: 'k',
			ctrl: true,
			shift: true,
			handler: () => {
				document
					.querySelector<HTMLInputElement>('input[aria-label="Command input"]')
					?.focus();
			},
			description: 'Focus terminal',
		},
	]);

	const handleFileSelect = useCallback(
		(item: FileSystemItem) => {
			if (item.type === 'file' && item.moduleId) {
				router.push(`/portfolio/${item.moduleId}`);
			}
		},
		[router],
	);

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		return (
			<div className="h-full w-full flex">
				{/* Sidebar Container - shows line when collapsed */}
				<motion.div
					initial={false}
					animate={{
						width: sidebar.isCollapsed ? 12 : 208,
					}}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					className="shrink-0 overflow-hidden bg-sidebar/50 border-r border-border relative z-20"
				>
					<Suspense fallback={<ComponentLoader />}>
						<AnimatePresence mode="wait">
							<Sidebar />
						</AnimatePresence>
					</Suspense>
				</motion.div>

				{/* Main Content + Terminal Area */}
				<div className="flex-1 min-w-0 flex flex-col relative">
					{/* Main Content */}
					<div className="flex-1 min-h-0 bg-card/80 relative z-0">{children}</div>

					{/* Terminal Container - shows line when collapsed */}
					<motion.div
						initial={false}
						animate={{
							height: terminal.isCollapsed ? 12 : 208,
						}}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="shrink-0 border-t border-border bg-card/80 overflow-hidden"
					>
						<Suspense fallback={<ComponentLoader height="h-32" />}>
							<AnimatePresence mode="wait">
								{terminal.isCollapsed ? (
									<motion.div
										key="collapsed-terminal"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="h-full w-full"
									>
										<CollapsedTerminal onExpand={terminal.expand} />
									</motion.div>
								) : (
									<motion.div
										key="expanded-terminal"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="h-full"
									>
										<CLI
											onToggleCollapse={terminal.collapse}
											isCollapsed={terminal.isCollapsed}
											onMaximize={terminal.maximize}
											onMinimize={terminal.collapse}
											onClose={terminal.collapse}
										/>
									</motion.div>
								)}
							</AnimatePresence>
						</Suspense>
					</motion.div>
				</div>
			</div>
		);
	};

	const renderMobileLayout = () => {
		if (!isMobile) return null;

		return (
			<div className="h-full w-full flex flex-col">
				<div className="flex-1 overflow-hidden border border-border bg-card/80">
					{children}
				</div>
				<div className="h-[40vh] border-t border-border bg-card/80">
					<Suspense fallback={<ComponentLoader height="h-32" />}>
						<CLI
							onToggleCollapse={terminal.collapse}
							isCollapsed={terminal.isCollapsed}
						/>
					</Suspense>
				</div>
			</div>
		);
	};

	return (
			<BootGuard>
				<ContextMenuProvider>
					<div className="fixed inset-0 flex flex-col overflow-hidden bg-black">

						<Suspense fallback={<ComponentLoader height="h-8" />}>
							<TopBar
								isMobile={isMobile}
								sidebarCollapsed={sidebar.isCollapsed}
								terminalCollapsed={terminal.isCollapsed}
								onToggleSidebar={
									sidebar.isCollapsed ? sidebar.expand : sidebar.collapse
								}
								onToggleTerminal={
									terminal.isCollapsed ? terminal.expand : terminal.collapse
								}
								onFileSelect={handleFileSelect}
							/>
						</Suspense>

						<div className="flex-1 min-h-0 w-full overflow-hidden relative z-10">
							{renderDesktopLayout()}
							{renderMobileLayout()}
						</div>

						<Suspense fallback={<ComponentLoader height="h-9" />}>
							<Taskbar />
						</Suspense>

						<Toaster
							position="top-right"
							toastOptions={{
								duration: 3000,
								style: {
									background: 'var(--background)',
									color: 'var(--foreground)',
									border: '1px solid var(--border)',
								},
							}}
						/>
					</div>
				</ContextMenuProvider>
			</BootGuard>
	);
}
