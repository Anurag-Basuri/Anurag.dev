'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { TopBar } from '@/layout/TopBar';
import dynamic from 'next/dynamic';
import { useAtom } from 'jotai';
import { windowStateAtom } from '@/boot/atoms';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Maximize2 } from 'lucide-react';
import { BootGuard } from '@/boot/components/BootGuard';

const ResizableSidebar = dynamic(() => import('@/layout/ResizableSidebar').then(m => m.ResizableSidebar), {
	ssr: false,
	loading: () => <div className="hidden md:flex rounded-xl bg-transparent border border-border shrink-0 overflow-hidden relative w-[280px] h-full animate-pulse bg-foreground/5" />,
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	const [windowState, setWindowState] = useAtom(windowStateAtom);
	const searchParams = useSearchParams();

	// Handle ?window=minimized from cross-page yellow dot click
	useEffect(() => {
		if (searchParams.get('window') === 'minimized') {
			setWindowState('minimized');
			// Clean up URL without triggering a reload
			const url = new URL(window.location.href);
			url.searchParams.delete('window');
			window.history.replaceState({}, '', url.toString());
		}
	}, [searchParams, setWindowState]);

	// Handle #contact hash from cross-page Contact button click
	useEffect(() => {
		if (window.location.hash === '#contact') {
			window.history.replaceState({}, '', window.location.pathname);
			window.dispatchEvent(
				new CustomEvent('scroll-to-section', { detail: { sectionId: 'contact' } }),
			);
		}
	}, []);

	return (
		<BootGuard>
			<div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent font-sans text-foreground">
				<AnimatePresence mode="wait">
					{windowState === 'open' && (
						<motion.div
							key="workspace"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.3, ease: 'easeOut' }}
							className="flex-1 flex flex-col min-h-0 w-full"
						>
							<TopBar />

							<div className="flex-1 flex min-h-0 w-full overflow-hidden p-1.5 md:p-2 gap-1.5">
								{/* Sidebar wrapper handles its own <aside> layer */}
								<Suspense
									fallback={<div className="hidden md:flex rounded-xl bg-transparent border border-border shrink-0 overflow-hidden relative w-[280px] h-full animate-pulse bg-foreground/5" />}
								>
									<ResizableSidebar />
								</Suspense>

								{/* Main content */}
								<main className="rounded-xl bg-transparent border border-border flex-1 min-h-0 overflow-hidden relative">
									<ErrorBoundary label="Main Content">
										<Suspense
											fallback={<div className="h-full w-full animate-pulse bg-foreground/5" />}
										>
											{children}
										</Suspense>
									</ErrorBoundary>
								</main>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Minimized State (Dock) */}
				<AnimatePresence>
					{windowState === 'minimized' && (
						<motion.div
							key="dock"
							initial={{ opacity: 0, y: 50, scale: 0.8 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 50, scale: 0.8 }}
							className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-50"
						>
							<button
								onClick={() => setWindowState('open')}
								className="flex items-center gap-3 px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 hover:scale-105 transition-all shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)] group cursor-pointer"
							>
								<div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
								<span className="text-xs sm:text-sm font-bold tracking-wider text-white/80 group-hover:text-white uppercase">
									Restore Workspace
								</span>
								<Maximize2 className="w-4 h-4 text-white/40 group-hover:text-emerald-400" />
							</button>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Closed State (Session Ended) */}
				<AnimatePresence>
					{windowState === 'closed' && (
						<motion.div
							key="locked"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-50"
						>
							<div className="flex flex-col items-center gap-6">
								<div className="text-emerald-500/40 font-mono text-xs sm:text-sm tracking-[0.3em] uppercase">
									Session Terminated
								</div>
								<button
									onClick={() => setWindowState('open')}
									className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-[#0a0a0a] border border-emerald-500/30 rounded-2xl hover:bg-emerald-950/40 transition-all hover:scale-105 overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)] cursor-pointer"
								>
									{/* Glitch layers on hover */}
									<div className="absolute inset-0 bg-emerald-500/20 translate-x-1 animate-pulse opacity-0 group-hover:opacity-100 blur-sm" />
									
									<div className="relative flex items-center gap-3 z-10">
										<Power className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:animate-pulse" />
										<span className="text-emerald-400 text-xs sm:text-base font-bold tracking-widest uppercase">
											Reinitialize System
										</span>
									</div>
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</BootGuard>
	);
}
