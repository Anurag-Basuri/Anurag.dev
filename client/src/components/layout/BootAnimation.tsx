'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Constants
const BOOT_SESSION_KEY = 'anuragos-boot-complete';
const ANIMATION_DURATION = 1.25; // seconds per phase
const BURST_DELAY = 400; // milliseconds
const MATRIX_CHARS = '01XYZπΩΣ∆';
const MATRIX_FONT_SIZE = 12;
const MATRIX_INTERVAL = 60; // milliseconds
const PARTICLE_COUNT = 60;

// Boot phases configuration - More Technical/OS flavored
const BOOT_PHASES = [
	{ label: 'BIOS', status: 'INITIALIZING KERNEL...' },
	{ label: 'SYSTEM', status: 'LOADING MODULES...' },
	{ label: 'USER', status: 'STARTING INTERFACE...' },
	{ label: 'READY', status: 'SYSTEM READY' },
] as const;

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
}

// Matrix Rain Effect Component - Subtle Background
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

			// Reset on resize
			const newColumns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
			if (newColumns !== columns) {
				columns = newColumns;
				drops = Array.from({ length: columns }, () => Math.random() * -100);
			}

			// Fade out trail
			ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#059669'; // Emerald-600 (Darker, more subtle)
			ctx.font = `${MATRIX_FONT_SIZE}px "Geist Mono", monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];

				// Randomly brighter characters
				if (Math.random() > 0.98) {
					ctx.fillStyle = '#34d399'; // Emerald-400 (Bright)
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
					ctx.fillStyle = '#059669'; // Reset
				} else {
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
				}

				if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.985) {
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

	return (
		<canvas ref={canvasRef} className="absolute inset-0 opacity-[0.07]" aria-hidden="true" />
	);
});

// Hexagon Grid Component
const HexGrid = memo(function HexGrid({ opacity }: { opacity: number }) {
	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
			style={{ opacity: opacity * 0.4 }} // Lower base opacity
			aria-hidden="true"
		>
			<div
				className="w-full h-full"
				style={{
					backgroundImage: `
						radial-gradient(circle at center, transparent 0%, #000 90%),
                        linear-gradient(30deg, #10b98115 12%, transparent 12.5%, transparent 87%, #10b98115 87.5%, #10b98115),
                        linear-gradient(150deg, #10b98115 12%, transparent 12.5%, transparent 87%, #10b98115 87.5%, #10b98115),
                        linear-gradient(30deg, #10b98115 12%, transparent 12.5%, transparent 87%, #10b98115 87.5%, #10b98115),
                        linear-gradient(150deg, #10b98115 12%, transparent 12.5%, transparent 87%, #10b98115 87.5%, #10b98115),
                        linear-gradient(60deg, #10b98110 25%, transparent 25.5%, transparent 75%, #10b98110 75%, #10b98110),
                        linear-gradient(60deg, #10b98110 25%, transparent 25.5%, transparent 75%, #10b98110 75%, #10b98110)
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

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
			const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
			const speed = Math.random() * 8 + 4; // Faster burst

			return {
				x: canvas.width / 2,
				y: canvas.height / 2,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 1,
				maxLife: 1,
			};
		});

		const draw = () => {
			if (!ctx || !canvas) return;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			let stillAlive = false;

			particles.forEach(particle => {
				particle.x += particle.vx;
				particle.y += particle.vy;
				particle.life -= 0.02; // Faster fade

				if (particle.life > 0) {
					stillAlive = true;
					ctx.globalAlpha = particle.life;
					ctx.fillStyle = '#34d399';
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

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 z-20 pointer-events-none"
			aria-hidden="true"
		/>
	);
});

// Main Boot Animation Component
export function BootAnimation() {
	const [, setBootComplete] = useAtom(bootCompleteAtom);
	const [status, setStatus] = useState('INITIALIZING...');
	const [progress, setProgress] = useState(0);
	const [showBurst, setShowBurst] = useState(false);
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
				// Ignore
			}
			setBootComplete(true);
		}, BURST_DELAY);
	}, [isCompleting, setBootComplete]);

	// Skip animation
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if ([' ', 'Enter', 'Escape'].includes(event.key)) {
				event.preventDefault();
				timelineRef.current?.kill();
				completeBoot();
			}
		};
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [completeBoot]);

	const handleSkipClick = useCallback(() => {
		timelineRef.current?.kill();
		completeBoot();
	}, [completeBoot]);

	// Animation Sequence
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
					},
					onUpdate: function () {
						const phaseProgress = this.progress();
						const currentProgress = Math.min(
							100,
							Math.floor(progressStart + phaseProgress * progressRange),
						);
						setProgress(currentProgress);
					},
					ease: 'power2.inOut',
				},
			);
		});

		return () => {
			timeline.kill();
		};
	}, [completeBoot]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
		};
	}, []);

	return (
		<motion.div
			className="fixed inset-0 z-50 bg-[#050505] text-emerald-500 font-mono overflow-hidden cursor-wait flex items-center justify-center"
			aria-label="Booting System"
			initial={{ opacity: 1 }}
			exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
			transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Smooth "Apple-like" exit
		>
			{/* Ambient Background */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black opacity-50" />
			<MatrixRain />
			<HexGrid opacity={isCompleting ? 0 : 1} />
			<ParticleBurst active={showBurst} />

			{/* Main Content Container */}
			<div className="relative z-10 flex flex-col items-center w-full max-w-lg p-8">
				{/* Logo / Title Area */}
				<div className="mb-12 relative group">
					<div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
					<div className="relative flex flex-col items-center">
						<div className="w-16 h-16 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] backdrop-blur-sm">
							<div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
						</div>

						<h1 className="text-4xl font-bold tracking-[0.2em] text-white mb-2 text-center select-none">
							ANURAG<span className="text-emerald-500">OS</span>
						</h1>
						<p className="text-xs uppercase tracking-[0.3em] text-emerald-500/60 font-medium">
							System Environment v2.4
						</p>
					</div>
				</div>

				{/* Progress Section */}
				<div className="w-full space-y-4">
					{/* Status Text */}
					<div className="flex justify-between items-end text-xs uppercase tracking-wider font-semibold">
						<span className="text-emerald-400/80 animate-pulse">{status}</span>
						<span className="text-white/40 tabular-nums">{progress}%</span>
					</div>

					{/* Progress Bar */}
					<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
						<div
							className="absolute h-full bg-emerald-500 shadow-[0_0_15px_2px_rgba(16,185,129,0.5)] transition-all duration-100 ease-linear rounded-full"
							style={{ width: `${progress}%` }}
						/>
					</div>

					{/* Footer Metadata */}
					<div className="flex justify-between text-[10px] text-white/20 font-mono pt-2">
						<span>MEM: 64GB OK</span>
						<span>CPU: QUANTUM-CORE OK</span>
						<span>GPU: ONLINE</span>
					</div>
				</div>

				{/* Skip Button (Subtle) */}
				<button
					onClick={handleSkipClick}
					className="absolute bottom-[-80px] text-[10px] uppercase tracking-widest text-white/10 hover:text-emerald-400 transition-colors duration-300"
				>
					Press Space to Skip
				</button>
			</div>

			{/* Vignette */}
			<div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_#000_90%)] pointer-events-none" />
		</motion.div>
	);
}
