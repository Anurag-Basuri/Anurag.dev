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
import { PANEL_CONFIG, PANEL_ANIMATION, PANEL_DESIGN } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { EmptyState } from '@/components/editor/EmptyState';
import { PanelContainer } from '@/components/layout/PanelContainer';
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

// Component loaders at module scope
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
			handler: () => sidebar.toggle(),
			description: 'Toggle sidebar',
		},
		{
			key: 'j',
			ctrl: true,
			handler: () => terminal.toggle(),
			description: 'Toggle terminal',
		},
		{
			key: 'Escape',
			handler: () => {
				if (modulePanel.isMaximized) {
					modulePanel.restore();
				}
			},
			description: 'Close maximized panel',
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

	// Synchronize horizontal panel layout with sidebar collapse state
	useEffect(() => {
		const api = horizontalGroupRef.current;
		if (!api) return;

		const [defaultH] = PANEL_CONFIG.DEFAULTS.horizontal;
		if (sidebar.isCollapsed) {
			api.setLayout({ sidebar: 0, main: 100 });
		} else {
			api.setLayout({
				sidebar: hSizes?.[0] ?? defaultH,
				main: hSizes?.[1] ?? 100 - defaultH,
			});
		}
	}, [sidebar.isCollapsed, hSizes]);

	// Synchronize vertical panel layout with terminal collapse state
	useEffect(() => {
		const api = verticalGroupRef.current;
		if (!api) return;

		const [defaultV] = PANEL_CONFIG.DEFAULTS.vertical;
		if (terminal.isCollapsed) {
			api.setLayout({ content: 100, terminal: 0 });
		} else {
			api.setLayout({
				content: vSizes?.[0] ?? defaultV,
				terminal: vSizes?.[1] ?? 100 - defaultV,
			});
		}
	}, [terminal.isCollapsed, vSizes]);

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
					defaultSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize}
					minSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.minSize}
					maxSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize}
					collapsible
					collapsedSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize}
					className="overflow-hidden"
				>
					<PanelContainer
						isCollapsed={sidebar.isCollapsed}
						className="bg-sidebar/40 border-r border-border/30 backdrop-blur-lg rounded-r-xl shadow-xl"
					>
						<Suspense fallback={<ComponentLoader />}>
							<Sidebar />
						</Suspense>
					</PanelContainer>
				</Panel>

				{/* Horizontal ResizeHandle - hides when sidebar collapsed */}
				<ResizeHandle isCollapsed={sidebar.isCollapsed} />

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
							defaultSize={PANEL_CONFIG.VERTICAL.CONTENT.defaultSize}
							minSize={PANEL_CONFIG.VERTICAL.CONTENT.minSize}
							className="overflow-hidden min-h-0"
						>
							<PanelContainer className="bg-card/80 backdrop-blur-xl rounded-xl shadow-xl border border-border/20">
								{renderModuleContent()}
							</PanelContainer>
						</Panel>

						{/* Vertical ResizeHandle - hides when terminal collapsed */}
						<ResizeHandle isCollapsed={terminal.isCollapsed} />

						{/* Terminal */}
						<Panel
							id="terminal"
							defaultSize={PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize}
							minSize={PANEL_CONFIG.VERTICAL.TERMINAL.minSize}
							maxSize={PANEL_CONFIG.VERTICAL.TERMINAL.maxSize}
							collapsible
							collapsedSize={PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize}
							className="overflow-hidden min-h-0"
						>
							<PanelContainer
								isCollapsed={terminal.isCollapsed}
								className="bg-card/70 border-t border-border/30 backdrop-blur-xl rounded-t-xl shadow-xl"
							>
								<ErrorBoundary>
									<Suspense fallback={<ComponentLoader height="h-32" />}>
										<CLI />
									</Suspense>
								</ErrorBoundary>
							</PanelContainer>
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
				<div className="h-full w-full bg-linear-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-xl shadow-xl border border-border/20">
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

						<Suspense fallback={<ComponentLoader height="h-8" />}>
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
