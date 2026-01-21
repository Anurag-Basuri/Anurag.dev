'use client';

import { Suspense, type ReactNode } from 'react';
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
const SIDEBAR = { min: 12, max: 35, default: 22, collapsed: 3 };
const TERMINAL = { min: 12, max: 55, default: 35, collapsed: 3 };
const CONTENT = { min: 30 };
const MAIN = { min: 50, default: 78 };

const isCollapsedSize = (size: PanelSize, collapsedSize: number) =>
	size.asPercentage <= collapsedSize + 0.5;

export function DesktopLayout({ children }: DesktopLayoutProps) {
	const { sidebar, terminal, setSidebarPanelRef, setTerminalPanelRef } = usePanelControls();

	return (
		<Group
			id="portfolio-main-h"
			orientation="horizontal"
			className={cn('h-full w-full', LAYOUT_SPACING.gap)}
			autoSave="portfolio-horizontal"
		>
			<Panel
				id="sidebar"
				panelRef={setSidebarPanelRef}
				defaultSize={SIDEBAR.default}
				minSize={SIDEBAR.min}
				maxSize={SIDEBAR.max}
				collapsible
				collapsedSize={SIDEBAR.collapsed}
				onResize={size => sidebar.setCollapsed(isCollapsedSize(size, SIDEBAR.collapsed))}
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
					autoSave="portfolio-vertical"
				>
					<Panel
						id="content"
						defaultSize={60}
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
						minSize={TERMINAL.min}
						maxSize={TERMINAL.max}
						collapsible
						collapsedSize={TERMINAL.collapsed}
						onResize={size =>
							terminal.setCollapsed(isCollapsedSize(size, TERMINAL.collapsed))
						}
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
