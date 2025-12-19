'use client';

import React, { Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
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
const FolderTree = dynamic(
	() => import('@/features/filesystem/FolderTree').then(mod => mod.FolderTree),
	{ ssr: false },
);
const SidebarProfile = dynamic(
	() => import('@/features/shell/SidebarProfile').then(mod => mod.SidebarProfile),
	{ ssr: false },
);
const Taskbar = dynamic(() => import('@/features/shell/Taskbar').then(mod => mod.Taskbar), {
	ssr: false,
	loading: () => <ComponentLoader height="h-8" />,
});
const TopBar = dynamic(() => import('@/features/shell/TopBar').then(mod => mod.TopBar), {
	ssr: false,
	loading: () => <ComponentLoader height="h-8" />,
});
const Background3D = dynamic(
	() => import('@/features/shell/Background3D').then(mod => mod.Background3D),
	{ ssr: false },
);
const NavRail = dynamic(() => import('@/features/shell/NavRail').then(mod => mod.NavRail), {
	ssr: false,
});

const ComponentLoader = ({ height = 'h-full' }: { height?: string }) => (
	// ... existing loader ...
	<div className={cn('w-full bg-card/50 animate-pulse flex items-center justify-center', height)}>
		<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
	</div>
);

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();

	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	const currentModule = useMemo(() => {
		const path = pathname.replace('/portfolio', '').replace(/^\/+/, '').replace(/\/+$/, '');
		return path || 'about';
	}, [pathname]);

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
				{/* Unified Navigation Rail */}
				<Suspense
					fallback={<div className="w-12 h-full bg-black/20 border-r border-white/5" />}
				>
					<NavRail
						sidebarCollapsed={sidebar.isCollapsed}
						terminalCollapsed={terminal.isCollapsed}
						onToggleSidebar={sidebar.isCollapsed ? sidebar.expand : sidebar.collapse}
						onToggleTerminal={
							terminal.isCollapsed ? terminal.expand : terminal.collapse
						}
					/>
				</Suspense>

				{/* Sidebar Content Area */}
				<motion.div
					initial={false}
					animate={{
						width: sidebar.isCollapsed ? 0 : 208,
						opacity: sidebar.isCollapsed ? 0 : 1,
					}}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					className="shrink-0 overflow-hidden bg-sidebar/50 border-r border-border"
				>
					<Suspense fallback={<ComponentLoader />}>
						<div className="h-full w-[208px] flex flex-col">
							<SidebarProfile
								onCollapse={sidebar.collapse}
								onExpand={sidebar.maximize}
							/>
							<div className="flex-1 overflow-auto px-2 pb-3 custom-scrollbar">
								<FolderTree
									items={fileSystem}
									onSelect={handleFileSelect}
									activeModuleId={currentModule}
								/>
							</div>
						</div>
					</Suspense>
				</motion.div>

				{/* Main Content + Terminal Area */}
				<div className="flex-1 min-w-0 flex flex-col relative">
					{/* Main Content */}
					<div className="flex-1 min-h-0 bg-card/80 relative z-0">{children}</div>

					{/* Terminal Container */}
					<motion.div
						initial={false}
						animate={{
							height: terminal.isCollapsed ? 0 : 208,
							opacity: terminal.isCollapsed ? 0 : 1,
						}}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="shrink-0 border-t border-border bg-card/80 overflow-hidden"
					>
						<Suspense fallback={<ComponentLoader height="h-32" />}>
							<CLI
								onToggleCollapse={terminal.collapse}
								isCollapsed={terminal.isCollapsed}
								onMaximize={terminal.maximize}
								onMinimize={terminal.collapse}
								onClose={terminal.collapse}
							/>
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
		<ErrorBoundary>
			<BootGuard>
				<ContextMenuProvider>
					<div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
						<Suspense fallback={null}>
							<Background3D />
						</Suspense>

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
		</ErrorBoundary>
	);
}
