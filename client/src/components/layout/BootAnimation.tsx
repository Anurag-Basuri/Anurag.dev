'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '../';
import gsap from 'gsap';
import { motion } from 'framer-motion';

// Constants
const BOOT_SESSION_KEY = 'anuragos-boot-complete';
const ANIMATION_DURATION = 1.25; // seconds per phase
const BURST_DELAY = 600; // milliseconds
const MATRIX_CHARS = '01अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षज्ञ';
const MATRIX_FONT_SIZE = 14;
const MATRIX_INTERVAL = 50; // milliseconds
const PARTICLE_COUNT = 80;

// Boot phases configuration
const BOOT_PHASES = [
	{ label: 'HELLO', status: 'HELLO, WORLD → PASSION FOR INTELLIGENT SYSTEMS' },
	{ label: 'FULL‑STACK UX', status: 'MODERN STACK + MERN → CLEAN, SCALABLE, HUMAN-CENTERED UX' },
	{ label: 'AI/ML + LLMs', status: 'AI/ML • LLMs • NLP → LEARNING, REASONING, ADAPTATION' },
	{ label: 'REAL IMPACT', status: 'REAL IMPACT OVER JUST CODE → PORTFOLIO READY' },
] as const;

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
}

// Matrix Rain Effect Component
const MatrixRain = memo(function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d', { alpha: false });
		if (!ctx) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const resize = () => {
			if (!canvas) return;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resize();
		window.addEventListener('resize', resize, { passive: true });

		let columns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
		let drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);

		let lastTime = 0;

		const draw = (timestamp: number) => {
			if (!ctx || !canvas) return;

			if (timestamp - lastTime < MATRIX_INTERVAL) {
				animRef.current = requestAnimationFrame(draw);
				return;
			}

			lastTime = timestamp;

			const newColumns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
			if (newColumns !== columns) {
				columns = newColumns;
				drops = Array.from({ length: columns }, () => Math.random() * -100);
			}

			ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#00ff41';
			ctx.font = `${MATRIX_FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
				ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);

				if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}

				drops[i] += prefersReducedMotion ? 0.5 : 1;
			}

			animRef.current = requestAnimationFrame(draw);
		};

		animRef.current = requestAnimationFrame(draw);

		return () => {
			if (animRef.current) {
				cancelAnimationFrame(animRef.current);
			}
			window.removeEventListener('resize', resize);
		};
	}, []);

	return <canvas ref={canvasRef} className="absolute inset-0 opacity-10" aria-hidden="true" />;
});

// Hexagon Grid Component
const HexGrid = memo(function HexGrid({ opacity }: { opacity: number }) {
	const clampedOpacity = Math.max(0, Math.min(1, opacity * 0.6));

	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-700"
			style={{ opacity: clampedOpacity }}
			aria-hidden="true"
		>
			<div
				className="w-full h-full"
				style={{
					backgroundImage: `
                        linear-gradient(30deg, #00ff4130 12%, transparent 12.5%, transparent 87%, #00ff4130 87.5%, #00ff4130),
                        linear-gradient(150deg, #00ff4130 12%, transparent 12.5%, transparent 87%, #00ff4130 87.5%, #00ff4130),
                        linear-gradient(30deg, #00ff4130 12%, transparent 12.5%, transparent 87%, #00ff4130 87.5%, #00ff4130),
                        linear-gradient(150deg, #00ff4130 12%, transparent 12.5%, transparent 87%, #00ff4130 87.5%, #00ff4130),
                        linear-gradient(60deg, #00ff4120 25%, transparent 25.5%, transparent 75%, #00ff4120 75%, #00ff4120),
                        linear-gradient(60deg, #00ff4120 25%, transparent 25.5%, transparent 75%, #00ff4120 75%, #00ff4120)
                    `,
					backgroundSize: '80px 140px',
					backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
				}}
			/>
		</div>
	);
});

// Particle Burst Component
const ParticleBurst = memo(function ParticleBurst({ active }: { active: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		if (!active) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
			const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
			const speed = Math.random() * 3 + 2;

			return {
				x: canvas.width / 2,
				y: canvas.height / 2,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 1,
				maxLife: Math.random() * 0.5 + 0.5,
			};
		});

		const draw = () => {
			if (!ctx || !canvas) return;

			ctx.globalAlpha = 1;
			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#00ff41';

			let stillAlive = false;

			particles.forEach(particle => {
				particle.x += particle.vx;
				particle.y += particle.vy;
				particle.life -= 0.01;

				if (particle.life > 0) {
					stillAlive = true;
					ctx.globalAlpha = Math.max(0, particle.life);
					ctx.beginPath();
					ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
					ctx.fill();
				}
			});

			if (stillAlive) {
				animRef.current = requestAnimationFrame(draw);
			}
		};

		animRef.current = requestAnimationFrame(draw);

		return () => {
			if (animRef.current) {
				cancelAnimationFrame(animRef.current);
			}
		};
	}, [active]);

	if (!active) return null;

	return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
});

// Main Boot Animation Component
export function BootAnimation() {
	const [, setBootComplete] = useAtom(bootCompleteAtom);
	const [phase, setPhase] = useState(0);
	const [status, setStatus] = useState('INITIALIZING SYSTEM');
	const [progress, setProgress] = useState(0);
	const [showBurst, setShowBurst] = useState(false);
	const [hexOpacity, setHexOpacity] = useState(0);
	const [isCompleting, setIsCompleting] = useState(false);

	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Complete boot animation
	const completeBoot = useCallback(() => {
		if (isCompleting) return;

		setIsCompleting(true);
		setProgress(100);
		setShowBurst(true);

		completionTimeoutRef.current = setTimeout(() => {
			try {
				sessionStorage.setItem(BOOT_SESSION_KEY, '1');
			} catch (error) {
				console.warn('Failed to set sessionStorage:', error);
			}
			setBootComplete(true);
		}, BURST_DELAY);
	}, [isCompleting, setBootComplete]);

	// Skip animation on keyboard input
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			const skipKeys = [' ', 'Enter', 'Escape'];

			if (skipKeys.includes(event.key)) {
				event.preventDefault();

				if (timelineRef.current) {
					timelineRef.current.kill();
				}

				completeBoot();
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [completeBoot]);

	// Main animation sequence
	useEffect(() => {
		const timeline = gsap.timeline({
			onComplete: completeBoot,
		});

		timelineRef.current = timeline;

		BOOT_PHASES.forEach((bootPhase, index) => {
			const progressStart = (index / BOOT_PHASES.length) * 100;
			const progressRange = 100 / BOOT_PHASES.length;

			timeline.to(
				{},
				{
					duration: ANIMATION_DURATION,
					onStart: () => {
						setStatus(bootPhase.status);
						setPhase(index);

						// Set hex opacity based on phase
						if (index === 1) setHexOpacity(0.6);
						if (index === 2) setHexOpacity(1);
					},
					onUpdate: function () {
						const phaseProgress = this.progress();
						setProgress(Math.floor(progressStart + phaseProgress * progressRange));
					},
				},
			);
		});

		return () => {
			timeline.kill();
		};
	}, [completeBoot]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timelineRef.current) {
				timelineRef.current.kill();
			}
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, []);

	const handleSkipClick = useCallback(() => {
		if (timelineRef.current) {
			timelineRef.current.kill();
		}
		completeBoot();
	}, [completeBoot]);

	const phaseTransform = `perspective(600px) rotateX(${Math.sin(phase * 0.5) * 2}deg)`;

	return (
		<motion.div
			className="fixed inset-0 z-50 bg-black text-[#00ff41] font-mono overflow-hidden"
			aria-label="Boot animation loading screen"
			role="dialog"
			aria-live="polite"
			initial={{ opacity: 1 }}
			exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
			transition={{ duration: 0.8, ease: 'easeInOut' }}
		>
			{/* Background layers */}
			<MatrixRain />
			<HexGrid opacity={hexOpacity} />
			<ParticleBurst active={showBurst} />

			{/* Main content */}
			<div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
				<div className="w-full max-w-6xl px-3 sm:px-5 md:px-8">
					<div className="py-6 sm:py-10 md:py-16 space-y-5 sm:space-y-7 md:space-y-10">
						{/* Title */}
						<div
							className="text-center select-none"
							style={{
								transform: phaseTransform,
								transition: 'transform 350ms ease-out',
							}}
						>
							<h1
								className="font-extrabold tracking-[0.12em] md:tracking-[0.18em]"
								style={{
									fontSize: 'clamp(1.8rem, 4.2vw + 0.5rem, 4.5rem)',
									color: '#00ff41',
									textShadow: '0 0 6px rgba(0,255,65,.2)',
									lineHeight: 1.08,
								}}
							>
								ANURAG BASURI
							</h1>
							<p
								className="mt-2 sm:mt-3 text-[#bdfccf]/85"
								style={{ fontSize: 'clamp(0.85rem, 1.1vw + 0.35rem, 1.1rem)' }}
							>
								Building at the intersection of full‑stack engineering and machine
								intelligence.
							</p>
						</div>

						{/* Status */}
						<div className="text-center">
							<div
								className="inline-flex items-center gap-2 uppercase tracking-wider"
								style={{
									fontSize: 'clamp(0.75rem, 0.9vw + 0.25rem, 1rem)',
									textShadow: '0 0 6px #00ff4128',
								}}
								aria-live="polite"
							>
								<span
									className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00ff41]"
									aria-hidden="true"
								/>
								{status}
							</div>
							<div className="mx-auto mt-2 h-px w-36 sm:w-56 md:w-64 bg-[#00ff41]/35" />
						</div>

						{/* Progress bar */}
						<div className="space-y-2">
							<div className="w-full max-w-xl mx-auto">
								<div className="relative h-1.5 md:h-2 bg-[#00ff41]/18 rounded-full overflow-hidden">
									<div
										className="absolute left-0 top-0 h-full rounded-full bg-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.45)] transition-[width] duration-300 ease-out"
										style={{ width: `${progress}%` }}
										aria-valuenow={progress}
										aria-valuemin={0}
										aria-valuemax={100}
										role="progressbar"
										aria-label="Boot progress"
									/>
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
								</div>
							</div>

							<div
								className="text-center font-mono tabular-nums opacity-80"
								style={{ fontSize: 'clamp(0.7rem, 0.85vw + 0.25rem, 0.95rem)' }}
								aria-live="polite"
							>
								<span className="text-[#00ff41]">[</span>
								{progress.toString().padStart(3, '0')}%
								<span className="text-[#00ff41]">]</span>
								<span className="ml-2 hidden sm:inline">BOOTING SYSTEM</span>
								<span className="ml-2 inline sm:hidden animate-pulse">BOOT...</span>
							</div>
						</div>

						{/* Phase indicators */}
						<div className="mx-auto w-full max-w-xl">
							<div className="flex flex-wrap justify-center gap-4 xs:gap-5 sm:gap-7 md:gap-9">
								{BOOT_PHASES.map((bootPhase, index) => (
									<div
										key={bootPhase.label}
										className="flex flex-col items-center"
									>
										<div
											className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-transform duration-300 ${
												phase >= index ? 'bg-[#00ff41]' : 'bg-[#00ff41]/30'
											}`}
											style={{
												transform:
													phase === index ? 'scale(1.15)' : 'scale(1)',
											}}
											aria-label={`Phase ${index + 1}: ${bootPhase.label}`}
											role="status"
										/>
										<span className="mt-2 text-[10px] sm:text-xs opacity-80 text-center">
											{bootPhase.label}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Bio description */}
						<div
							className="mx-auto w-full max-w-3xl px-2 sm:px-0"
							style={{ fontSize: 'clamp(0.8rem, 1vw + 0.25rem, 1rem)' }}
						>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-10 gap-y-2 sm:gap-y-3 text-center text-[#bdfccf]/85">
								<div className="space-y-1 leading-relaxed sm:justify-self-end sm:text-right max-w-[30ch] sm:max-w-[32ch] mx-auto sm:mx-0">
									<div>Clean, scalable UX with Next.js & MERN</div>
									<div>AI/ML, LLMs, NLP — learning, reasoning, adaptation</div>
								</div>
								<div className="space-y-1 leading-relaxed sm:justify-self-start sm:text-left max-w-[30ch] sm:max-w-[32ch] mx-auto sm:mx-0">
									<div>LeetCode 450+ • consistency that compounds</div>
									<div>Exploring internships & freelancing • real impact</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Skip button */}
				<div className="pointer-events-auto">
					<button
						type="button"
						onClick={handleSkipClick}
						disabled={isCompleting}
						className="absolute bottom-5 sm:bottom-6 md:bottom-8 right-5 sm:right-6 md:right-8 px-4 py-2 md:px-6 md:py-3 bg-black/25 text-[#00ff41] hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider text-xs md:text-sm z-20 font-bold rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00ff41]/50"
						aria-label="Skip boot animation and enter system"
					>
						SKIP BOOT{' '}
						<span className="ml-1" aria-hidden="true">
							›
						</span>
					</button>
				</div>

				{/* Keyboard hint */}
				<div className="absolute bottom-5 sm:bottom-6 md:bottom-8 left-5 sm:left-6 md:left-8 text-[10px] sm:text-xs text-[#00ff41]/60 pointer-events-none">
					Press{' '}
					<kbd className="px-1.5 py-0.5 bg-[#00ff41]/10 rounded border border-[#00ff41]/20">
						ESC
					</kbd>{' '}
					or{' '}
					<kbd className="px-1.5 py-0.5 bg-[#00ff41]/10 rounded border border-[#00ff41]/20">
						SPACE
					</kbd>{' '}
					to skip
				</div>
			</div>

			{/* Scanline effect */}
			<div
				className="scanlines pointer-events-none absolute inset-0 z-30"
				aria-hidden="true"
			/>
		</motion.div>
	);
}
