'use client';

import { useState, useEffect, memo, type FC } from 'react';
import { Rocket, Brain, Terminal } from 'lucide-react';
import { MatrixRain } from './MatrixRain';
import { BootProgress } from './BootProgress';
import { useBootSequence } from '../hooks/useBootSequence';
import { ROLES } from '../constants';

// ============================================================================
// Internal Components
// ============================================================================

// Decorative hex grid background pattern. Fades out during boot completion transition.
const HexGrid = memo(function HexGrid({ visible }: { visible: boolean }) {
	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
			style={{ opacity: visible ? 0.2 : 0 }}
			aria-hidden="true"
		>
			<div className="w-full h-full bg-[radial-gradient(#10b98115_1px,transparent_1px)] bg-size-[32px_32px]" />
		</div>
	);
});

interface TypewriterProps {
	texts: readonly string[];
}

// Animated typewriter effect that cycles through an array of texts. Types out each string, pauses, then deletes and moves to the next.
const Typewriter = memo(function Typewriter({ texts }: TypewriterProps) {
	const [index, setIndex] = useState(0);
	const [displayText, setDisplayText] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const currentText = texts[index];
		const speed = isDeleting ? 30 : 50;

		const timeout = setTimeout(() => {
			if (!isDeleting && displayText === currentText) {
				setTimeout(() => setIsDeleting(true), 2000);
			} else if (isDeleting && displayText === '') {
				setIsDeleting(false);
				setIndex(i => (i + 1) % texts.length);
			} else {
				setDisplayText(
					currentText.substring(0, displayText.length + (isDeleting ? -1 : 1)),
				);
			}
		}, speed);

		return () => clearTimeout(timeout);
	}, [displayText, isDeleting, index, texts]);

	return (
		<span className="inline-block text-emerald-400 font-bold min-h-[1.5em]" aria-live="polite">
			{displayText}
			<span
				className="animate-pulse ml-1 inline-block w-2.5 h-4 bg-emerald-500 align-middle"
				aria-hidden="true"
			/>
		</span>
	);
});

// ============================================================================
// Main Component
// ============================================================================

// Boot screen component that displays during application initialization. Features Matrix rain effect, typewriter animation, and progress bar. Can be skipped via keyboard (Space/Enter/Escape) or button click.
export function BootScreen() {
	const { status, progress, isCompleting, skip } = useBootSequence();

	return (
		<div
			className="fixed inset-0 bg-[#020202] text-emerald-500 font-mono overflow-hidden cursor-default flex items-center justify-center"
			style={{ zIndex: 9999 }}
			aria-label="Booting Portfolio"
			role="alert"
			aria-busy="true"
		>
			{/* Background layers */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-emerald-900/15 via-[#020202] to-black opacity-90" />
			<MatrixRain />
			<HexGrid visible={!isCompleting} />

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
				{/* Card */}
				<div className="relative z-20 w-full flex justify-center">
					<div className="bg-black/60 backdrop-blur-xl border border-emerald-500/20 p-8 sm:p-14 rounded-2xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden w-full max-w-xl">
						{/* Inner Glow */}
						<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />

						<div className="relative z-10 flex flex-col items-center text-center">
							{/* Icons */}
							<div className="flex gap-6 mb-8 text-emerald-500/60">
								<Terminal className="w-6 h-6 animate-pulse" />
								<Rocket className="w-6 h-6 text-emerald-400" />
								<Brain className="w-6 h-6" />
							</div>

							{/* Title */}
							<div className="flex flex-col items-center gap-2 mb-4">
								<h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white/90 uppercase">
									Anurag&apos;s
								</h1>
								<div className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-cyan-400 to-emerald-400">
									PORTFOLIO
								</div>
							</div>

							{/* Typewriter */}
							<div className="h-8 sm:h-10 mb-8 sm:mb-12 flex items-center justify-center">
								<p className="text-sm sm:text-lg font-medium tracking-[0.2em] uppercase text-emerald-500/80">
									<Typewriter texts={ROLES} />
								</p>
							</div>

							{/* Divider */}
							<div className="w-24 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent mb-10" />

							{/* Progress */}
							<BootProgress status={status} progress={progress} />
						</div>
					</div>
				</div>

				{/* Creative Skip Prompt */}
				<div className="absolute bottom-8 sm:bottom-12 w-full flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-forwards opacity-0 [animation-delay:1.5s]">
					<div className="flex items-center gap-3 group px-6 py-2">
						<div className="text-emerald-500/40 font-mono text-xs uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">
							PRESS
						</div>
						
						{/* Stylized Spacebar Key */}
						<div className="relative group cursor-pointer">
							{/* Glitch layers on hover */}
							<div className="absolute inset-0 bg-emerald-500/20 translate-x-1 animate-pulse opacity-0 group-hover:opacity-100 blur-sm rounded border border-emerald-400" />
							<div className="absolute inset-0 bg-cyan-500/20 -translate-x-1 animate-pulse opacity-0 group-hover:opacity-100 blur-sm rounded border border-cyan-400" />
							
							<div className="relative border-b-4 border-r-2 border-emerald-500/30 bg-black/50 px-8 py-1.5 rounded-lg flex items-center justify-center min-w-[120px] transition-all duration-150 group-hover:bg-emerald-500/10 group-active:border-b-0 group-active:border-r-0 group-active:translate-y-1 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_20px_0_rgba(16,185,129,0.5)]">
								<div className="w-16 h-1 bg-emerald-500/30 rounded-full group-hover:bg-emerald-400 transition-colors" />
							</div>
						</div>
						
						<div className="text-emerald-500/40 font-mono text-xs uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">
							TO SKIP
						</div>
					</div>
					
					<p className="text-[9px] text-emerald-500/20 font-mono tracking-widest uppercase">
						Or click anywhere to bypass
					</p>
				</div>
			</div>
		</div>
	);
}

// Backward compatibility export
export { BootScreen as Introduction };

