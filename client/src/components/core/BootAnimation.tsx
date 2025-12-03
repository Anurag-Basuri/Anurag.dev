'use client';

import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store/atoms';
import gsap from 'gsap';

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

	return <canvas ref={canvasRef} className="absolute inset-0 opacity-20" />;
}

// Hexagon Grid Component
function HexGrid({ opacity }: { opacity: number }) {
	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-700"
			style={{ opacity }}
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
					maskImage:
						'radial-gradient(ellipse at center, rgba(0,0,0,0.9), rgba(0,0,0,0.2))',
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

	// Keyboard accessibility: press Enter or Space to skip
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Enter' || e.key === ' ') {
				setBootComplete(true);
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [setBootComplete]);

	useEffect(() => {
		// GSAP Timeline orchestrating the boot sequence (content mirrors LinkedIn bio)
		const tl = gsap.timeline({
			onComplete: () => {
				setShowBurst(true);
				setTimeout(() => setBootComplete(true), 1500);
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
						setStatus('NEXT.JS + MERN → CLEAN, SCALABLE, HUMAN-CENTERED UX');
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

		return () => {
			tl.kill();
		};
	}, [setBootComplete]);

	const handleSkip = () => setBootComplete(true);

	if (bootComplete) return null;

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-[9999] bg-black text-[#00ff41] font-mono overflow-hidden"
			aria-label="Boot animation loading screen"
			role="dialog"
			aria-live="polite"
		>
			{/* Background layers */}
			<MatrixRain />
			<HexGrid opacity={hexOpacity} />
			<ParticleBurst active={showBurst} />

			{/* Content (no box/container) */}
			<div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
				<div className="w-full max-w-4xl px-4 sm:px-6">
					<div className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-7">
						{/* Title */}
						<div
							className="text-center select-none"
							style={{
								transform: `perspective(500px) rotateX(${
									Math.sin(phase * 0.5) * 3
								}deg)`,
								transition: 'transform 0.5s ease-out',
							}}
						>
							<h1
								className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.2em] md:tracking-[0.25em]"
								style={{
									color: '#00ff41',
									textShadow:
										'0 1px 0 #003a0e, 0 2px 0 #002a08, 0 3px 0 #001a04, 0 4px 0 #000a02, 0 6px 1px rgba(0,0,0,.12), 0 0 6px rgba(0,255,65,.28), 0 3px 6px rgba(0,0,0,.25)',
								}}
							>
								ANURAG BASURI
							</h1>
							<p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-[#bdfccf]/80">
								Building at the intersection of full‑stack engineering and machine
								intelligence.
							</p>
						</div>

						{/* Status */}
						<div className="text-center">
							<div
								className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#00ff41]/30 bg-black/30 text-xs sm:text-sm md:text-base uppercase tracking-wider"
								style={{ textShadow: '0 0 8px #00ff4150' }}
								aria-live="polite"
							>
								<span className="inline-block w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_10px_#00ff41]" />
								{status}
							</div>
						</div>

						{/* Progress */}
						<div className="space-y-2">
							<div className="w-full max-w-lg mx-auto">
								<div className="h-3 md:h-4 overflow-hidden border border-[#00ff41] rounded-sm shadow-[0_0_16px_rgba(0,255,65,0.2)]">
									<div
										className="h-full bg-linear-to-r from-[#00ff41] via-[#00cc33] to-[#00aa22] transition-all duration-300 ease-out relative"
										style={{ width: `${progress}%` }}
										aria-valuenow={progress}
										aria-valuemin={0}
										aria-valuemax={100}
										role="progressbar"
									>
										<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent" />
									</div>
								</div>
							</div>

							<div className="text-center text-[11px] sm:text-xs md:text-sm opacity-75 font-mono tabular-nums tracking-wider">
								<span className="text-[#00ff41]">[</span>
								{progress.toString().padStart(3, '0')}%
								<span className="text-[#00ff41]">]</span>
								<span className="ml-2 hidden sm:inline">BOOTING SYSTEM</span>
								<span className="ml-2 inline sm:hidden animate-pulse">BOOT...</span>
							</div>
						</div>

						{/* Phase indicator */}
						<div className="flex items-center justify-center gap-4">
							{['HELLO', 'UX', 'AI', 'IMPACT'].map((label, idx) => (
								<div key={label} className="flex items-center gap-2">
									<div
										className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 ${
											phase >= idx
												? 'border-[#00ff41] bg-[#00ff41] shadow-[0_0_10px_#00ff41]'
												: 'border-[#003311] bg-transparent'
										}`}
										style={{
											transform: phase >= idx ? 'scale(1.15)' : 'scale(1)',
										}}
										aria-label={`Phase ${idx + 1}: ${label}`}
									/>
									<span className="text-[10px] sm:text-xs opacity-70">
										{label}
									</span>
								</div>
							))}
						</div>

						{/* Bio lines */}
						<div className="grid md:grid-cols-2 gap-3 text-xs sm:text-sm text-[#bdfccf]/80">
							<div className="space-y-1">
								<div>Clean, scalable UX with Next.js & MERN</div>
								<div>AI/ML, LLMs, NLP — learning, reasoning, adaptation</div>
							</div>
							<div className="space-y-1">
								<div>LeetCode 450+ • consistency that compounds</div>
								<div>Real impact over just code</div>
							</div>
						</div>
					</div>
				</div>

				{/* Skip button */}
				<div className="pointer-events-auto">
					<button
						onClick={handleSkip}
						className="absolute bottom-6 right-6 md:bottom-8 md:right-8 px-4 py-2 md:px-6 md:py-3 bg-black/50 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:scale-[1.03] transition-all duration-200 uppercase tracking-wider text-xs md:text-sm z-20 font-bold rounded-sm shadow-[0_0_20px_rgba(0,255,65,0.25)]"
						aria-label="Skip boot animation"
					>
						SKIP BOOT <span className="ml-1">›</span>
					</button>
				</div>
			</div>

			{/* Scanline effect */}
			<div className="scanlines pointer-events-none absolute inset-0 z-30" />
		</div>
	);
}
