'use client';

import { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BootProgress } from './BootProgress';
import { useBootSequence } from '../hooks/useBootSequence';
import { BOOT_CONFIG } from '../constants';

// ============================================================================
// Boot Screen — "Quiet Reveal"
// ============================================================================
// A minimal, premium intro splash. No canvas, no matrix rain — pure CSS +
// Framer Motion. Shows monogram initials, clean name, thin progress line,
// static subtitle, and an elegant skip hint. Exits with a zoom-in + blur
// that suggests "entering" the workspace.

export function BootScreen() {
	const { progress, isCompleting, skip } = useBootSequence();
	const [showSkipHint, setShowSkipHint] = useState(false);

	// Fade in the skip hint after a delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSkipHint(true);
		}, BOOT_CONFIG.SKIP_HINT_DELAY);
		return () => clearTimeout(timer);
	}, []);

	return (
		<AnimatePresence>
			{!isCompleting ? (
				<motion.div
					key="boot"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{
						opacity: 0,
						scale: 1.04,
						filter: 'blur(6px)',
					}}
					transition={{
						duration: 0.4,
						ease: [0.4, 0, 0.2, 1],
					}}
					className="fixed inset-0 flex items-center justify-center cursor-default select-none"
					style={{ zIndex: 9999, background: '#050505' }}
					aria-label="Loading Portfolio"
					role="status"
				>
					{/* Subtle radial vignette — pure CSS */}
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							background:
								'radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 60%)',
						}}
					/>

					{/* Content */}
					<div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
						{/* Monogram */}
						<motion.div
							initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
							animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
							transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
							className="mb-8"
						>
							<div
								className="text-[42px] sm:text-[52px] font-extralight tracking-[0.3em] text-white/90"
								style={{
									textShadow: '0 0 40px rgba(255,255,255,0.08)',
									fontFamily: 'Inter, system-ui, sans-serif',
								}}
							>
								A<span className="text-white/30 mx-1">.</span>B
							</div>
						</motion.div>

						{/* Name */}
						<motion.h1
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
							className="text-sm sm:text-base font-light tracking-[0.25em] uppercase text-white/60 mb-6"
							style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
						>
							Anurag Basuri
						</motion.h1>

						{/* Progress Line */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.3 }}
							className="w-full mb-6"
						>
							<BootProgress progress={progress} />
						</motion.div>

						{/* Subtitle */}
						<motion.p
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.45, duration: 0.35, ease: 'easeOut' }}
							className="text-[11px] sm:text-xs font-normal tracking-[0.15em] text-white/25 uppercase"
						>
							Full Stack Engineer & AI Systems
						</motion.p>
					</div>

					{/* Skip Hint — fades in after delay */}
					<div className="absolute bottom-8 sm:bottom-12 w-full flex justify-center">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: showSkipHint ? 1 : 0 }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
							className="text-center"
						>
							{/* Desktop */}
							<p className="hidden sm:block text-[11px] tracking-[0.12em] text-white/20 font-light">
								Press any key to enter{' '}
								<span className="text-white/30">↵</span>
							</p>
							{/* Mobile */}
							<p className="block sm:hidden text-[11px] tracking-[0.12em] text-white/20 font-light">
								Tap anywhere to enter
							</p>
						</motion.div>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

// Backward compatibility export
export { BootScreen as Introduction };
