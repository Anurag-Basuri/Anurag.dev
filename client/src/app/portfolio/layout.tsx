'use client';

import React, { Suspense, useCallback, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import {
	mainVerticalSizesAtom,
	mainHorizontalSizesAtom,
	layoutStateAtom,
	bootCompleteAtom,
} from '@/store';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import dynamic from 'next/dynamic';

import { CLI } from '@/features/terminal/CLI';
import { FolderTree } from '@/features/filesystem/FolderTree';
import { SidebarProfile } from '@/features/shell/SidebarProfile';
import { Taskbar } from '@/features/shell/Taskbar';
import { Background3D } from '@/features/shell/Background3D';
import { CollapsedSidebar } from '@/features/shell/CollapsedSidebar';
import { TopBar } from '@/features/shell/TopBar';

// Loading placeholder
const ComponentLoader = ({ height = 'h-full' }: { height?: string }) => (
	<div className={cn('w-full bg-card/50 animate-pulse flex items-center justify-center', height)}>
		<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
	</div>
);

// Dynamically import Introduction to avoid SSR issues and circular deps
const BootAnimation = dynamic(
	() =>
		import('@/components/layout/Introduction')
			.then(mod => ({ default: mod.Introduction }))
			.catch(() => ({
				default: () => {
					const [, setBootComplete] = useAtom(bootCompleteAtom);
					useEffect(() => setBootComplete(true), [setBootComplete]);
					return null;
				},
			})),
	{
		ssr: false,
		loading: () => (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
			</div>
		),
	},
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();

	const [bootComplete] = useAtom(bootCompleteAtom);
	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);
	const [layoutState, setLayoutState] = useAtom(layoutStateAtom);

	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	// Get current module from pathname with memoization
	const currentModule = useMemo(() => {
		const path = pathname.replace('/portfolio', '').replace(/^\/+/, '').replace(/\/+$/, '');
		return path || 'about';
	}, [pathname]);

	// Keyboard shortcuts
	useKeyboardShortcuts([
		{
			key: 'b',
			ctrl: true,
			handler: () => {
				if (sidebar.isCollapsed) {
					sidebar.expand();
				} else {
					sidebar.collapse();
				}
			},
			description: 'Toggle sidebar',
		},
		{
			key: '`',
			ctrl: true,
			handler: () => {
				if (terminal.isCollapsed) {
					terminal.expand();
				} else {
					terminal.collapse();
				}
			},
			description: 'Toggle terminal',
		},
		{
			key: 'k',
			ctrl: true,
			shift: true,
			handler: () => {
				const terminalInput = document.querySelector<HTMLInputElement>(
					'input[aria-label="Command input"]',
				);
				terminalInput?.focus();
			},
			description: 'Focus terminal',
		},
	]);

	// Navigate to module based on file selection
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
			<ResizablePanelGroup
				direction="horizontal"
				onLayout={layout => {
					setMainHorizontalSizes(layout);
					setLayoutState(prev => ({
						...prev,
						main: { ...prev.main, horizontal: layout },
						sidebar: { ...prev.sidebar, size: layout[0] },
					}));
				}}
				className="h-full w-full gap-1"
			>
				<ResizablePanel
					{...sidebar.panelProps}
					defaultSize={mainHorizontalSizes[0]}
					className={cn(
						'overflow-hidden bg-card/80',
						sidebar.isCollapsed ? '' : 'border border-border',
					)}
				>
					<Suspense fallback={<ComponentLoader />}>
						<div className="h-full w-full">
							{sidebar.isCollapsed ? (
								<div className="h-full bg-sidebar/50 animate-in fade-in duration-150">
									<CollapsedSidebar onExpand={sidebar.expand} />
								</div>
							) : (
								<div className="h-full bg-sidebar/50 flex flex-col animate-in fade-in duration-200">
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
						</div>
					</Suspense>
				</ResizablePanel>

				<ResizableHandle
					withHandle
					className="w-[2px] bg-border data-[resize-handle-state=hover]:bg-primary/80 data-[resize-handle-state=drag]:bg-primary"
				/>

				<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
					<ResizablePanelGroup
						direction="vertical"
						onLayout={layout => {
							setMainVerticalSizes(layout);
							setLayoutState(prev => ({
								...prev,
								main: { ...prev.main, vertical: layout },
								terminal: { ...prev.terminal, size: layout[1] },
							}));
						}}
						className="h-full w-full gap-1"
					>
						<ResizablePanel
							defaultSize={mainVerticalSizes[0]}
							minSize={40}
							className="overflow-hidden border border-border bg-card/80"
						>
							{/* Route content renders here */}
							{children}
						</ResizablePanel>

						<ResizableHandle
							withHandle
							className="h-[2px] bg-border data-[resize-handle-state=hover]:bg-primary/80 data-[resize-handle-state=drag]:bg-primary"
						/>

						<ResizablePanel
							{...terminal.panelProps}
							defaultSize={mainVerticalSizes[1]}
							className="overflow-hidden border border-border bg-card/80"
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
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		);
	};

	const renderMobileLayout = () => {
		if (!isMobile) return null;

		return (
			<div className="h-full w-full flex flex-col overflow-hidden">
				<div className="flex-1 overflow-hidden border border-border bg-card/80">
					{children}
				</div>
				<div className="h-[40vh] overflow-hidden border-t border-border bg-card/80">
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

	if (!bootComplete) {
		return <BootAnimation />;
	}

	return (
		<ErrorBoundary>
			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
					{/* Background */}
					<Suspense fallback={null}>
						<Background3D />
					</Suspense>

					{/* Top Bar */}
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

					{/* Main Content */}
					<div className="flex-1 min-h-0 w-full overflow-hidden relative z-10">
						{renderDesktopLayout()}
						{renderMobileLayout()}
					</div>

					{/* Taskbar */}
					<Suspense fallback={<ComponentLoader height="h-9" />}>
						<Taskbar />
					</Suspense>

					{/* Toast Notifications */}
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
		</ErrorBoundary>
	);
}
