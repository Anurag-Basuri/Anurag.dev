'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { PANEL_STYLES, LAYOUT_SPACING } from '../constants';
import dynamic from 'next/dynamic';
import { usePanelControls } from '@/contexts/panel-context';
import type { PanelSize } from 'react-resizable-panels';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <Loader height="h-32" />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});

interface DesktopLayoutProps {
	children: ReactNode;
}

// Panel size configuration (percentages)
// Note: For collapsible panels, minSize should not be set (library handles it)
const SIDEBAR = { max: 35, default: 20, collapsed: 0 };
const TERMINAL = { max: 60, default: 35, collapsed: 0 };
const CONTENT = { min: 25 };
const MAIN = { min: 50, default: 80 };

// Threshold for detecting collapsed state (accounts for floating point)
const COLLAPSED_THRESHOLD = 1;

export function DesktopLayout({ children }: DesktopLayoutProps) {
	const { sidebar, terminal, setSidebarPanelRef, setTerminalPanelRef } = usePanelControls();

	// Handle sidebar resize - sync collapsed state
	const handleSidebarResize = useCallback(
		(size: PanelSize) => {
			const isCollapsed = size.asPercentage <= COLLAPSED_THRESHOLD;
			sidebar.setCollapsed(isCollapsed);
		},
		[sidebar],
	);

	// Handle terminal resize - sync collapsed state
	const handleTerminalResize = useCallback(
		(size: PanelSize) => {
			const isCollapsed = size.asPercentage <= COLLAPSED_THRESHOLD;
			terminal.setCollapsed(isCollapsed);
		},
		[terminal],
	);

	return (
		<Group
			id="portfolio-main-h"
			orientation="horizontal"
			className={cn('h-full w-full', LAYOUT_SPACING.gap)}
			autoSave="portfolio-h"
		>
			<Panel
				id="sidebar"
				panelRef={setSidebarPanelRef}
				defaultSize={SIDEBAR.default}
				maxSize={SIDEBAR.max}
				collapsible
				collapsedSize={SIDEBAR.collapsed}
				onResize={handleSidebarResize}
				className={cn(
					PANEL_STYLES.base,
					PANEL_STYLES.sidebar,
					sidebar.isCollapsed && PANEL_STYLES.collapsed,
				)}
			>
				<ErrorBoundary>
					<Suspense fallback={<Loader />}>
						<Sidebar />
					</Suspense>
				</ErrorBoundary>
			</Panel>

			<ResizeHandle isCollapsed={sidebar.isCollapsed} orientation="vertical" />

			<Panel id="main" defaultSize={MAIN.default} minSize={MAIN.min} className="min-w-0">
				<Group
					id="portfolio-main-v"
					orientation="vertical"
					className={cn('h-full', LAYOUT_SPACING.gap)}
					autoSave="portfolio-v"
				>
					<Panel
						id="content"
						defaultSize={65}
						minSize={CONTENT.min}
						className={cn(PANEL_STYLES.base, PANEL_STYLES.content, 'min-h-0')}
					>
						<ErrorBoundary>
							<Suspense fallback={<Loader />}>{children}</Suspense>
						</ErrorBoundary>
					</Panel>

					<ResizeHandle isCollapsed={terminal.isCollapsed} orientation="horizontal" />

					<Panel
						id="terminal"
						panelRef={setTerminalPanelRef}
						defaultSize={TERMINAL.default}
						maxSize={TERMINAL.max}
						collapsible
						collapsedSize={TERMINAL.collapsed}
						onResize={handleTerminalResize}
						className={cn(
							PANEL_STYLES.base,
							PANEL_STYLES.terminal,
							'min-h-0',
							terminal.isCollapsed && PANEL_STYLES.collapsed,
						)}
					>
						<ErrorBoundary>
							<Suspense fallback={<Loader height="h-32" />}>
								<CLI />
							</Suspense>
						</ErrorBoundary>
					</Panel>
				</Group>
			</Panel>
		</Group>
	);
}
