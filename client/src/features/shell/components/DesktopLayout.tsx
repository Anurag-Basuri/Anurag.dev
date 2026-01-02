'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { PANEL_CONFIG, PANEL_COLLAPSE_THRESHOLD } from '@/lib/constants';
import { PANEL_STYLES, LAYOUT_SPACING } from '../constants';
import dynamic from 'next/dynamic';
import type { Layout } from 'react-resizable-panels';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <Loader height="h-32" />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});

interface DesktopLayoutProps {
	children: ReactNode;
	sidebar: { isCollapsed: boolean };
	terminal: { isCollapsed: boolean };
	hSizes: number[] | null;
	vSizes: number[] | null;
	setHSizes: (sizes: number[]) => void;
	setVSizes: (sizes: number[]) => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	setTerminalCollapsed: (collapsed: boolean) => void;
	setHorizontalGroupRef: (ref: unknown) => void;
	setVerticalGroupRef: (ref: unknown) => void;
	setSidebarPanelRef: (ref: unknown) => void;
	setTerminalPanelRef: (ref: unknown) => void;
}

export function DesktopLayout({
	children,
	sidebar,
	terminal,
	hSizes,
	vSizes,
	setHSizes,
	setVSizes,
	setSidebarCollapsed,
	setTerminalCollapsed,
	setHorizontalGroupRef,
	setVerticalGroupRef,
	setSidebarPanelRef,
	setTerminalPanelRef,
}: DesktopLayoutProps) {
	const COLLAPSE_EPS = PANEL_COLLAPSE_THRESHOLD;

	const handleHorizontalLayoutChange = useCallback(
		(layout: Layout) => {
			const sidebarSize = layout['sidebar'];
			const mainSize = layout['main'];
			if (typeof sidebarSize !== 'number' || typeof mainSize !== 'number') return;

			const isNowCollapsed = sidebarSize <= COLLAPSE_EPS;
			if (isNowCollapsed !== sidebar.isCollapsed) {
				setSidebarCollapsed(isNowCollapsed);
			}

			if (!isNowCollapsed) {
				setHSizes([sidebarSize, mainSize]);
			}
		},
		[COLLAPSE_EPS, sidebar.isCollapsed, setSidebarCollapsed, setHSizes],
	);

	const handleVerticalLayoutChange = useCallback(
		(layout: Layout) => {
			const contentSize = layout['content'];
			const terminalSize = layout['terminal'];
			if (typeof contentSize !== 'number' || typeof terminalSize !== 'number') return;

			const isNowCollapsed = terminalSize <= COLLAPSE_EPS;
			if (isNowCollapsed !== terminal.isCollapsed) {
				setTerminalCollapsed(isNowCollapsed);
			}

			if (!isNowCollapsed) {
				setVSizes([contentSize, terminalSize]);
			}
		},
		[COLLAPSE_EPS, terminal.isCollapsed, setTerminalCollapsed, setVSizes],
	);

	return (
		<Group
			id="portfolio-main-h"
			orientation="horizontal"
			className={cn('h-full w-full', LAYOUT_SPACING.gap)}
			groupRef={setHorizontalGroupRef}
			defaultLayout={{ sidebar: hSizes?.[0] ?? 20, main: hSizes?.[1] ?? 80 }}
			onLayoutChange={handleHorizontalLayoutChange}
		>
			<Panel
				id="sidebar"
				panelRef={setSidebarPanelRef}
				defaultSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize)}
				minSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.minSize)}
				maxSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize)}
				collapsible
				collapsedSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize)}
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

			<Panel id="main" defaultSize="80%" minSize="50%" className="min-w-0">
				<Group
					id="portfolio-main-v"
					orientation="vertical"
					className={cn('h-full', LAYOUT_SPACING.gap)}
					groupRef={setVerticalGroupRef}
					defaultLayout={{ content: vSizes?.[0] ?? 60, terminal: vSizes?.[1] ?? 40 }}
					onLayoutChange={handleVerticalLayoutChange}
				>
					<Panel
						id="content"
						defaultSize={parseFloat(PANEL_CONFIG.VERTICAL.CONTENT.defaultSize)}
						minSize={parseFloat(PANEL_CONFIG.VERTICAL.CONTENT.minSize)}
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
						defaultSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize)}
						minSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.minSize)}
						maxSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize)}
						collapsible
						collapsedSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize)}
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
