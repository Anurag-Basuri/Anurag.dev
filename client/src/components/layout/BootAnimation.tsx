'use client';

import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import gsap from 'gsap';
import { motion } from 'framer-motion';

// Matrix Rain Effect Component (perf + accessibility)
function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const prefersReducedMotion = window.matchMedia?.(
			'(prefers-reduced-motion: reduce)',
		).matches;

		function resize() {
			if (!canvas) return;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		resize();
		window.addEventListener('resize', resize);

		const chars = '01अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षज्ञ';
		const fontSize = 14;
		let columns = Math.floor(canvas.width / fontSize);
		let drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

		let lastTime = 0;
		const intervalMs = 50;

		function draw(ts: number) {
			if (!ctx || !canvas) return;

			if (ts - lastTime < intervalMs) {
				animRef.current = requestAnimationFrame(draw);
				return;
			}
			lastTime = ts;

			const newColumns = Math.floor(canvas.width / fontSize);
			if (newColumns !== columns) {
				columns = newColumns;
				drops = new Array(columns).fill(0).map(() => Math.random() * -100);
			}

			ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#00ff41';
			ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

			for (let i = 0; i < drops.length; i++) {
				const text = chars[Math.floor(Math.random() * chars.length)];
				ctx.fillText(text, i * fontSize, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i] += prefersReducedMotion ? 0.5 : 1;
			}

			animRef.current = requestAnimationFrame(draw);
		}

		animRef.current = requestAnimationFrame(draw);

		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current);
			window.removeEventListener('resize', resize);
		};
	}, []);

	return <canvas ref={canvasRef} className="absolute inset-0 opacity-10" />;
}

// Hexagon Grid Component
function HexGrid({ opacity }: { opacity: number }) {
	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-700"
			// decrease overall presence of the grid
			style={{ opacity: Math.max(0, Math.min(1, opacity * 0.6)) }}
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
                        linear-gradient(60deg, #00332270 25%, transparent 25.5%, transparent 75%, #00332270 75%, #00332270),
                        linear-gradient(60deg, #00332270 25%, transparent 25.5%, transparent 75%, #00332270 75%, #00332270)
                    `,
					backgroundSize: '80px 140px',
					backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
					// darker at top, slightly brighter toward bottom
					maskImage: `
                        linear-gradient(
                            to bottom,
                            rgba(0,0,0,0.92) 0%,
                            rgba(0,0,0,0.75) 35%,
                            rgba(0,0,0,0.45) 70%,
                            rgba(0,0,0,0.25) 100%
                        )
                    `,
					// subtle luminance lift near bottom without adding boxy feel
					filter: 'brightness(0.95)',
				}}
			/>
		</div>
	);
}

// Particle Burst Component
function ParticleBurst({ active }: { active: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!active) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const prefersReducedMotion = window.matchMedia?.(
			'(prefers-reduced-motion: reduce)',
		).matches;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const particles: Array<{
			x: number;
			y: number;
			vx: number;
			vy: number;
			life: number;
			maxLife: number;
		}> = [];

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const count = prefersReducedMotion ? 40 : 120;

		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count;
			const velocity =
				(prefersReducedMotion ? 1.5 : 2.2) +
				Math.random() * (prefersReducedMotion ? 1.5 : 3.2);
			particles.push({
				x: centerX,
				y: centerY,
				vx: Math.cos(angle) * velocity,
				vy: Math.sin(angle) * velocity,
				life: 0,
				maxLife:
					(prefersReducedMotion ? 36 : 64) +
					Math.random() * (prefersReducedMotion ? 18 : 36),
			});
		}

		let animId = 0;
		function draw() {
			if (!ctx || !canvas) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;
				p.life++;

				const alpha = 1 - p.life / p.maxLife;
				ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
				ctx.beginPath();
				ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
				ctx.fill();
			});

			if (particles.every(p => p.life >= p.maxLife)) {
				cancelAnimationFrame(animId);
			} else {
				animId = requestAnimationFrame(draw);
			}
		}

		animId = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(animId);
	}, [active]);

	if (!active) return null;
	return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}

export function BootAnimation() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [phase, setPhase] = useState(0);
	const [status, setStatus] = useState('INITIALIZING SYSTEM');
	const [progress, setProgress] = useState(0);
	const [showBurst, setShowBurst] = useState(false);
	const [hexOpacity, setHexOpacity] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	// Check if user has visited before
	useEffect(() => {
		const hasVisited = localStorage.getItem('anuragos-visited');
		if (hasVisited) {
			setBootComplete(true);
		} else {
			localStorage.setItem('anuragos-visited', 'true');
		}
	}, [setBootComplete]);

	// Keyboard accessibility: press any key to skip
	useEffect(() => {
		function onKey() {
			// Skip on any key press
			sessionStorage.setItem('booted', '1');
			setBootComplete(true);
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [setBootComplete]);

	useEffect(() => {
		// GSAP Timeline orchestrating the boot sequence (content mirrors LinkedIn bio)
		const tl = gsap.timeline({
			onComplete: () => {
				setShowBurst(true);
				setTimeout(() => {
					sessionStorage.setItem('booted', '1');
					setBootComplete(true);
				}, 1500);
			},
		});

		tl.to(
			{},
			{
				duration: 1.6,
				onStart: () => {
					setStatus('HELLO, WORLD → PASSION FOR INTELLIGENT SYSTEMS');
					setPhase(0);
				},
				onUpdate: function () {
					setProgress(Math.floor(this.progress() * 25));
				},
			},
		)
			.to(
				{},
				{
					duration: 1.6,
					onStart: () => {
						setStatus('MODERN STACK + MERN → CLEAN, SCALABLE, HUMAN-CENTERED UX');
						setPhase(1);
						setHexOpacity(0.6);
					},
					onUpdate: function () {
						setProgress(25 + Math.floor(this.progress() * 25));
					},
				},
			)
			.to(
				{},
				{
					duration: 1.6,
					onStart: () => {
						setStatus('AI/ML • LLMs • NLP → LEARNING, REASONING, ADAPTATION');
						setPhase(2);
						setHexOpacity(1);
					},
					onUpdate: function () {
						setProgress(50 + Math.floor(this.progress() * 25));
					},
				},
			)
			.to(
				{},
				{
					duration: 1.6,
					onStart: () => {
						setStatus('REAL IMPACT OVER JUST CODE → PORTFOLIO READY');
						setPhase(3);
					},
					onUpdate: function () {
						setProgress(75 + Math.floor(this.progress() * 25));
					},
				},
			);

		// Safety timeout to ensure boot completes even if animation hangs
		const safetyTimer = setTimeout(() => {
			if (!bootComplete) {
				sessionStorage.setItem('booted', '1');
				setBootComplete(true);
			}
		}, 8000);

		return () => {
			tl.kill();
			clearTimeout(safetyTimer);
		};
	}, [setBootComplete]);

	const handleSkip = () => {
		sessionStorage.setItem('booted', '1');
		setBootComplete(true);
	};

	return (
		<motion.div
			ref={containerRef}
			className="fixed inset-0 z-[9999] bg-black text-[#00ff41] font-mono overflow-hidden"
			aria-label="Boot animation loading screen"
			role="dialog"
			aria-live="polite"
			exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
			transition={{ duration: 0.8, ease: 'easeInOut' }}
		>
			{/* Background layers */}
			<MatrixRain />
			<HexGrid opacity={hexOpacity} />
			<ParticleBurst active={showBurst} />

			{/* Content (clean, centered, responsive) */}
			<div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
				<div className="w-full max-w-6xl px-3 sm:px-5 md:px-8">
					<div className="py-6 sm:py-10 md:py-16 space-y-5 sm:space-y-7 md:space-y-10">
						<div
							className="text-center select-none"
							style={{
								transform: `perspective(600px) rotateX(${
									Math.sin(phase * 0.5) * 2.0
								}deg)`,
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

						{/* Status (minimal accent) */}
						<div className="text-center">
							<div
								className="inline-flex items-center gap-2 uppercase tracking-wider"
								style={{
									fontSize: 'clamp(0.75rem, 0.9vw + 0.25rem, 1rem)',
									textShadow: '0 0 6px #00ff4128',
								}}
								aria-live="polite"
							>
								<span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00ff41]" />
								{status}
							</div>
							<div className="mx-auto mt-2 h-px w-36 sm:w-56 md:w-64 bg-[#00ff41]/35" />
						</div>

						{/* Progress (thin neon track) */}
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
									/>
									<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />
								</div>
							</div>

							<div
								className="text-center font-mono tabular-nums opacity-80"
								style={{ fontSize: 'clamp(0.7rem, 0.85vw + 0.25rem, 0.95rem)' }}
							>
								<span className="text-[#00ff41]">[</span>
								{progress.toString().padStart(3, '0')}%
								<span className="text-[#00ff41]">]</span>
								<span className="ml-2 hidden sm:inline">BOOTING SYSTEM</span>
								<span className="ml-2 inline sm:hidden animate-pulse">BOOT...</span>
							</div>
						</div>

						{/* Phases (clean dots, evenly spaced, centered labels) */}
						<div className="mx-auto w-full max-w-xl">
							<div className="flex flex-wrap justify-center gap-4 xs:gap-5 sm:gap-7 md:gap-9">
								{['HELLO', 'FULL‑STACK UX', 'AI/ML + LLMs', 'REAL IMPACT'].map(
									(label, idx) => (
										<div key={label} className="flex flex-col items-center">
											<div
												className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-transform duration-300 ${
													phase >= idx
														? 'bg-[#00ff41]'
														: 'bg-[#00ff41]/30'
												}`}
												style={{
													transform:
														phase === idx ? 'scale(1.15)' : 'scale(1)',
												}}
												aria-label={`Phase ${idx + 1}: ${label}`}
											/>
											<span className="mt-2 text-[10px] sm:text-xs opacity-80 text-center">
												{label}
											</span>
										</div>
									),
								)}
							</div>
						</div>

						{/* Bio lines (clean, centered, responsive) */}
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

				{/* Skip button (subtle) */}
				<div className="pointer-events-auto">
					<button
						onClick={handleSkip}
						className="absolute bottom-5 sm:bottom-6 md:bottom-8 right-5 sm:right-6 md:right-8 px-4 py-2 md:px-6 md:py-3 bg-black/25 text-[#00ff41] hover:bg-black/40 transition-all duration-200 uppercase tracking-wider text-xs md:text-sm z-20 font-bold rounded-sm"
						aria-label="Skip boot animation"
					>
						SKIP BOOT <span className="ml-1">›</span>
					</button>
				</div>
			</div>

			{/* Scanline effect */}
			<div className="scanlines pointer-events-none absolute inset-0 z-30" />
		</motion.div>
	);
}
