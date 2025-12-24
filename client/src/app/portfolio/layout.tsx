'use client';

import { Suspense, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { FileSystemItem } from '@/data/filesystem';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { BootGuard } from '@/components/layout/BootGuard';
import { useAtom } from 'jotai';
import { mainHorizontalSizesAtom, mainVerticalSizesAtom, openFilesAtom } from '@/store';
import dynamic from 'next/dynamic';
import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { EmptyState } from '@/components/editor/EmptyState';
import type { GroupImperativeHandle, Layout } from 'react-resizable-panels';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <ComponentLoader height="h-32" />,
});
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

const ModuleHeader = dynamic(
	() => import('@/features/shell/components/ModuleHeader').then(mod => mod.ModuleHeader),
	{ ssr: false },
);

const ComponentLoader = ({ height = 'h-full' }: { height?: string }) => (
	<div className={cn('w-full bg-card/50 animate-pulse flex items-center justify-center', height)}>
		<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
	</div>
);

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();

	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });
	const modulePanel = useCollapsiblePanel({ type: 'module' });

	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	const horizontalGroupRef = useRef<GroupImperativeHandle | null>(null);
	const verticalGroupRef = useRef<GroupImperativeHandle | null>(null);

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

	const [, setOpenFiles] = useAtom(openFilesAtom);

	const getModuleIdFromPathname = useCallback((path: string): string | null => {
		const segments = path.split('/').filter(Boolean);
		const lastSegment = segments[segments.length - 1];

		if (!lastSegment || lastSegment === 'portfolio') return null;

		const aliases: Record<string, string> = {
			bio: 'about',
			work: 'projects',
			connect: 'contact',
			certs: 'certifications',
		};

		return aliases[lastSegment] || lastSegment;
	}, []);

	const currentModuleId = getModuleIdFromPathname(pathname);

	// Synchronize open files with navigation.
	useEffect(() => {
		if (!currentModuleId) return;

		setOpenFiles(prev => {
			const existingIndex = prev.findIndex(f => f.moduleId === currentModuleId);
			if (existingIndex !== -1) {
				const updated = [...prev];
				const [existing] = updated.splice(existingIndex, 1);
				return [...updated, { ...existing, openedAt: Date.now() }];
			}
			return [...prev, { moduleId: currentModuleId, openedAt: Date.now() }];
		});
	}, [pathname, currentModuleId, setOpenFiles]);

	const handleFileSelect = useCallback(
		(item: FileSystemItem) => {
			if (item.type === 'file' && item.moduleId) {
				router.push(`/portfolio/${item.moduleId}`);
			}
		},
		[router],
	);

	const renderModuleContent = (className?: string) => {
		if (!currentModuleId) return children;

		const Icon = getModuleIcon(currentModuleId);
		const title = getModuleTitle(currentModuleId);

		return (
			<div className={cn('h-full flex flex-col min-w-0', className)}>
				<ModuleHeader
					icon={Icon}
					title={title}
					isMaximized={modulePanel.isMaximized}
					onMaximize={
						modulePanel.isMaximized ? modulePanel.restore : modulePanel.maximize
					}
					onMinimize={modulePanel.toggle}
					onClose={() => router.push('/portfolio')}
				/>
				<div className="flex-1 min-h-0 relative">
					{modulePanel.isCollapsed ? <EmptyState /> : children}
				</div>
			</div>
		);
	};

	useEffect(() => {
		const api = horizontalGroupRef.current;
		if (!api) return;

		if (sidebar.isCollapsed) {
			api.setLayout({ sidebar: 0, main: 100 });
		} else {
			api.setLayout({ sidebar: hSizes?.[0] ?? 20, main: hSizes?.[1] ?? 80 });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sidebar.isCollapsed]);

	useEffect(() => {
		const api = verticalGroupRef.current;
		if (!api) return;

		if (terminal.isCollapsed) {
			api.setLayout({ content: 100, terminal: 0 });
		} else {
			api.setLayout({ content: vSizes?.[0] ?? 60, terminal: vSizes?.[1] ?? 40 });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [terminal.isCollapsed]);

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		return (
			<Group
				id="portfolio-main-h"
				orientation="horizontal"
				className="h-full w-full gap-1"
				groupRef={horizontalGroupRef}
				defaultLayout={{ sidebar: hSizes?.[0] ?? 20, main: hSizes?.[1] ?? 80 }}
				onLayoutChange={(layout: Layout) => {
					if (typeof layout.sidebar === 'number' && typeof layout.main === 'number') {
						setHSizes([layout.sidebar, layout.main]);
					}
				}}
			>
				{/* Sidebar */}
				<Panel
					id="sidebar"
					defaultSize="20%"
					minSize="10%"
					maxSize="30%"
					collapsible
					collapsedSize="0%"
					className="overflow-hidden"
				>
					<div className="h-full bg-sidebar/50 border-r border-border/50 backdrop-blur-md rounded-r-xl shadow-2xl shadow-black/20 transition-all duration-300">
						<Suspense fallback={<ComponentLoader />}>
							<Sidebar />
						</Suspense>
					</div>
				</Panel>

				<ResizeHandle />

				{/* Main Content + Terminal */}
				<Panel id="main" defaultSize="80%" minSize="50%" className="min-w-0">
					<Group
						id="portfolio-main-v"
						orientation="vertical"
						className="h-full gap-1"
						groupRef={verticalGroupRef}
						defaultLayout={{ content: vSizes?.[0] ?? 60, terminal: vSizes?.[1] ?? 40 }}
						onLayoutChange={(layout: Layout) => {
							if (
								typeof layout.content === 'number' &&
								typeof layout.terminal === 'number'
							) {
								setVSizes([layout.content, layout.terminal]);
							}
						}}
					>
						{/* Content Area */}
						<Panel
							id="content"
							defaultSize="65%"
							minSize="30%"
							className="overflow-hidden min-h-0"
						>
							<div className="h-full w-full bg-linear-to-br from-card/90 to-card/70 backdrop-blur-lg rounded-xl shadow-2xl border border-border/40 transition-all duration-300 hover:shadow-emerald-500/10">
								{renderModuleContent()}
							</div>
						</Panel>

						<ResizeHandle />

						{/* Terminal */}
						<Panel
							id="terminal"
							defaultSize="35%"
							minSize="10%"
							maxSize="60%"
							collapsible
							collapsedSize="0%"
							className="overflow-hidden min-h-0"
						>
							<div className="h-full bg-card/80 border-t border-border/50 backdrop-blur-md rounded-t-xl shadow-2xl shadow-black/20 transition-all duration-300">
								<Suspense fallback={<ComponentLoader height="h-32" />}>
									<CLI />
								</Suspense>
							</div>
						</Panel>
					</Group>
				</Panel>
			</Group>
		);
	};

	const renderMobileLayout = () => {
		if (!isMobile) return null;

		return (
			<div className="h-full w-full flex flex-col">
				<div className="flex-1 overflow-hidden border border-border bg-card/80">
					{renderModuleContent()}
				</div>
			</div>
		);
	};

	return (
		<ErrorBoundary>
			<BootGuard>
				<ContextMenuProvider>
					<div className="fixed inset-0 flex flex-col overflow-hidden bg-black font-sans selection:bg-emerald-500/30">
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

						<AnimatePresence>
							{modulePanel.isMaximized && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="fixed inset-0 z-100 bg-black"
								>
									{renderModuleContent('maximized-content')}
								</motion.div>
							)}
						</AnimatePresence>

						<Suspense fallback={<ComponentLoader height="h-9" />}>
							<Taskbar isMobile={isMobile} />
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
