'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const COLLAPSED_WIDTH = 88;
const SNAP_THRESHOLD = 180;

export function ResizableSidebar() {
	const [width, setWidth] = useState(280);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Load stored user preference
	useEffect(() => {
		setMounted(true);
		const savedWidth = localStorage.getItem('sidebar-width');
		const savedCollapsed = localStorage.getItem('sidebar-collapsed');
		if (savedWidth) setWidth(Number(savedWidth));
		if (savedCollapsed) setIsCollapsed(savedCollapsed === 'true');
	}, []);

	// Save changes to storage
	useEffect(() => {
		if (!mounted) return;
		localStorage.setItem('sidebar-width', width.toString());
		localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
	}, [width, isCollapsed, mounted]);

	// Dragging physics
	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			setIsDragging(true);
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';

			const startX = e.clientX;
			const startWidth = width;
			const wasCollapsed = isCollapsed;

			const onPointerMove = (moveEvent: PointerEvent) => {
				const delta = moveEvent.clientX - startX;
				// If we were collapsed, dragging right inherently pops it open starting from MIN_WIDTH
				let baseWidth = wasCollapsed ? MIN_WIDTH : startWidth;
				let newWidth = baseWidth + delta;

				if (newWidth <= SNAP_THRESHOLD) {
					setIsCollapsed(true);
				} else {
					setIsCollapsed(false);
					if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
					if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
					setWidth(newWidth);
				}
			};

			const onPointerUp = () => {
				setIsDragging(false);
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		},
		[width, isCollapsed]
	);

	const toggleCollapse = () => {
		setIsCollapsed(prev => !prev);
	};

	// To prevent hydration mismatch, render a static placeholder until mounted
	if (!mounted) {
		return (
			<aside className="hidden md:flex rounded-xl bg-transparent border border-border shrink-0 overflow-hidden relative" style={{ width: 280 }}>
				<div className="h-full w-full animate-pulse bg-foreground/5" />
			</aside>
		);
	}

	const currentWidth = isCollapsed ? COLLAPSED_WIDTH : width;

	return (
		<motion.aside
			className="hidden md:flex rounded-xl bg-transparent border border-border shrink-0 relative group"
			animate={{ width: currentWidth }}
			transition={
				isDragging
					? { type: 'tween', duration: 0 } // No animation while dragging, immediate tracking
					: { type: 'spring', bounce: 0.15, duration: 0.5 } // Smooth snap when toggling/snapping
			}
		>
			<div className="flex-1 min-w-0 h-full w-full rounded-xl overflow-hidden bg-card/10 backdrop-blur-sm z-0">
				<ErrorBoundary label="Sidebar">
					<Sidebar isCollapsed={isCollapsed} />
				</ErrorBoundary>
			</div>

			{/* Resize Handle Area */}
			<div
				className="absolute top-0 right-0 w-3 h-full cursor-col-resize z-20 flex items-center justify-center -mr-1.5 group/handle"
				onPointerDown={handlePointerDown}
			>
				{/* Premium Visible Grip Pill */}
				<div
					className={cn(
						'w-1 h-12 rounded-full transition-all duration-300 pointer-events-none shadow-sm',
						isDragging
							? 'bg-emerald-400 h-16 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
							: 'bg-border/60 group-hover/handle:bg-emerald-500/50 group-hover/handle:h-16 group-hover/handle:shadow-[0_0_8px_rgba(52,211,153,0.4)]'
					)}
				/>
			</div>

			{/* Toggle Button (Always visible) */}
			<motion.button
				initial={false}
				onClick={toggleCollapse}
				className={cn(
					'absolute z-30 -right-3 top-8 w-6 h-6 rounded-full border border-border/80 bg-background/80 backdrop-blur-md flex items-center justify-center text-muted-foreground shadow-sm hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-400 hover:scale-110 transition-all cursor-pointer pointer-events-auto',
				)}
			>
				{isCollapsed ? <ChevronRight className="w-3.5 h-3.5 translate-x-0.5" /> : <ChevronLeft className="w-3.5 h-3.5 -translate-x-0.5" />}
			</motion.button>
		</motion.aside>
	);
}
