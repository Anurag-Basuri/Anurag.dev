'use client';

import React, { Suspense, useCallback, useMemo } from 'react';
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
	loading: () => <ComponentLoader height="h-9" />,
});
const Background3D = dynamic(
	() => import('@/features/shell/Background3D').then(mod => mod.Background3D),
	{ ssr: false },
);
const CollapsedSidebar = dynamic(
	() => import('@/features/shell/CollapsedSidebar').then(mod => mod.CollapsedSidebar),
	{ ssr: false },
);
const TopBar = dynamic(() => import('@/features/shell/TopBar').then(mod => mod.TopBar), {
	ssr: false,
	loading: () => <ComponentLoader height="h-8" />,
});

const ComponentLoader = ({ height = 'h-full' }: { height?: string }) => (
	<div className={cn('w-full bg-card/50 animate-pulse flex items-center justify-center', height)}>
		<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
	</div>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
				{/* Sidebar - Fixed width */}
				<div
					className={cn(
						'shrink-0 transition-all duration-200 overflow-hidden bg-card/80',
						sidebar.isCollapsed ? 'w-12' : 'w-64 border-r border-border',
					)}
				>
					<Suspense fallback={<ComponentLoader />}>
						{sidebar.isCollapsed ? (
							<div className="h-full bg-sidebar/50">
								<CollapsedSidebar onExpand={sidebar.expand} />
							</div>
						) : (
							<div className="h-full bg-sidebar/50 flex flex-col">
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
						)}
					</Suspense>
				</div>

				{/* Main Content + Terminal */}
				<div className="flex-1 min-w-0 flex flex-col">
					{/* Main Content */}
					<div className="flex-1 min-h-0 border border-border bg-card/80">{children}</div>

					{/* Terminal - Fixed height when open */}
					{!terminal.isCollapsed && (
						<div className="h-52 shrink-0 border-t border-border bg-card/80">
							<Suspense fallback={<ComponentLoader height="h-32" />}>
								<CLI
									onToggleCollapse={terminal.collapse}
									isCollapsed={terminal.isCollapsed}
									onMaximize={terminal.maximize}
									onMinimize={terminal.collapse}
									onClose={terminal.collapse}
								/>
							</Suspense>
						</div>
					)}
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
