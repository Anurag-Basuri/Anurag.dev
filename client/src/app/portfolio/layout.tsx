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
import { openFilesAtom } from '@/store';
import dynamic from 'next/dynamic';
import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { Group, Panel, type GroupImperativeHandle, type Layout } from 'react-resizable-panels';
import { mainHorizontalSizesAtom, mainVerticalSizesAtom } from '@/store';
import { EmptyState } from '@/components/editor/EmptyState';
import { ResizeHandle } from '@/components/common/ResizeHandle';

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

function clampPercentPair(a: unknown, b: unknown, fallback: [number, number]) {
	const aNum = typeof a === 'number' && Number.isFinite(a) ? a : fallback[0];
	const bNum = typeof b === 'number' && Number.isFinite(b) ? b : fallback[1];
	const sum = aNum + bNum;

	if (sum <= 0) return fallback;

	const aPct = (aNum / sum) * 100;
	const bPct = (bNum / sum) * 100;

	return [aPct, bPct] as const;
}

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();

	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });
	const modulePanel = useCollapsiblePanel({ type: 'module' });

	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	const horizontalGroupRef = useRef<GroupImperativeHandle>(null);
	const verticalGroupRef = useRef<GroupImperativeHandle>(null);

	const handleHorizontalLayoutChange = useCallback(
		(layout: Layout) => {
			const nextSidebar = layout.sidebar;
			const nextMain = layout.main;
			if (typeof nextSidebar !== 'number' || typeof nextMain !== 'number') return;
			setHSizes([nextSidebar, nextMain]);
		},
		[setHSizes],
	);

	const handleVerticalLayoutChange = useCallback(
		(layout: Layout) => {
			const nextContent = layout.content;
			const nextTerminal = layout.terminal;
			if (typeof nextContent !== 'number' || typeof nextTerminal !== 'number') return;
			setVSizes([nextContent, nextTerminal]);
		},
		[setVSizes],
	);

	// Keep panel geometry roughly in sync with collapse toggles.
	useEffect(() => {
		const api = horizontalGroupRef.current;
		if (!api) return;

		if (sidebar.isCollapsed) {
			api.setLayout({ sidebar: 6, main: 94 });
		} else {
			const [s, m] = clampPercentPair(hSizes?.[0], hSizes?.[1], [20, 80]);
			api.setLayout({ sidebar: s, main: m });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sidebar.isCollapsed]);

	useEffect(() => {
		const api = verticalGroupRef.current;
		if (!api) return;

		if (terminal.isCollapsed) {
			api.setLayout({ content: 100, terminal: 0 });
		} else {
			const [c, t] = clampPercentPair(vSizes?.[0], vSizes?.[1], [60, 40]);
			api.setLayout({ content: c, terminal: t });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [terminal.isCollapsed]);

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

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		const [sidebarSize, mainSize] = clampPercentPair(hSizes?.[0], hSizes?.[1], [20, 80]);
		const [contentSize, terminalSize] = clampPercentPair(vSizes?.[0], vSizes?.[1], [60, 40]);

		return (
			<Group
				id="portfolio-main-h"
				orientation="horizontal"
				groupRef={horizontalGroupRef}
				defaultLayout={{ sidebar: sidebarSize, main: mainSize }}
				onLayoutChange={handleHorizontalLayoutChange}
				className="h-full w-full"
			>
				<Panel
					id="sidebar"
					minSize="10"
					className="bg-sidebar/50 border-r border-border relative z-20 min-w-0"
				>
					<Suspense fallback={<ComponentLoader />}>
						<Sidebar />
					</Suspense>
				</Panel>

				<ResizeHandle id="sidebar-resize-handle" />

				<Panel id="main" minSize="30" className="min-w-0">
					<Group
						id="portfolio-main-v"
						orientation="vertical"
						groupRef={verticalGroupRef}
						defaultLayout={{ content: contentSize, terminal: terminalSize }}
						onLayoutChange={handleVerticalLayoutChange}
						className="h-full w-full"
					>
						<Panel id="content" minSize="20" className="min-h-0">
							<div className="h-full w-full overflow-hidden border border-border bg-card/80">
								{renderModuleContent()}
							</div>
						</Panel>

						<ResizeHandle id="terminal-resize-handle" />

						<Panel
							id="terminal"
							minSize="0"
							className="min-h-0 border-t border-border bg-card/70"
						>
							<Suspense fallback={<ComponentLoader height="h-32" />}>
								<CLI />
							</Suspense>
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
