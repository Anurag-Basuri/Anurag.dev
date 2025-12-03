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

			// Throttle to ~20 FPS to avoid high CPU on large screens
			if (ts - lastTime < intervalMs) {
				animRef.current = requestAnimationFrame(draw);
				return;
			}
			lastTime = ts;

			// Recompute columns if resized
			const newColumns = Math.floor(canvas.width / fontSize);
			if (newColumns !== columns) {
				columns = newColumns;
				drops = new Array(columns).fill(0).map(() => Math.random() * -100);
			}

			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#00ff41';
			ctx.font = `${fontSize}px monospace`;

			for (let i = 0; i < drops.length; i++) {
				const text = chars[Math.floor(Math.random() * chars.length)];
				ctx.fillText(text, i * fontSize, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i] += prefersReducedMotion ? 0.5 : 1; // slower for reduced motion
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
			className="absolute inset-0 pointer-events-none transition-opacity duration-1000 flex items-center justify-center"
			style={{ opacity }}
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

		const count = prefersReducedMotion ? 50 : 120;

		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count;
			const velocity =
				(prefersReducedMotion ? 1.5 : 2) + Math.random() * (prefersReducedMotion ? 1.5 : 3);
			particles.push({
				x: centerX,
				y: centerY,
				vx: Math.cos(angle) * velocity,
				vy: Math.sin(angle) * velocity,
				life: 0,
				maxLife:
					(prefersReducedMotion ? 40 : 60) +
					Math.random() * (prefersReducedMotion ? 20 : 40),
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
	return <canvas ref={canvasRef} className="absolute inset-0" />;
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
			className="fixed inset-0 z-9999 bg-black text-[#00ff41] font-mono overflow-hidden"
			aria-label="Boot animation loading screen"
			role="dialog"
			aria-live="polite"
		>
			{/* Matrix Rain Background */}
			<MatrixRain />

			{/* Hex Grid */}
			<HexGrid opacity={hexOpacity} />

			{/* Particle Burst */}
			<ParticleBurst active={showBurst} />

			{/* UI Overlay */}
			<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
				<div className="text-center space-y-6 md:space-y-8 px-4 max-w-3xl mx-auto">
					{/* Logo/Title with 3D effect */}
					<div
						className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-widest relative"
						style={{
							color: '#00ff41',
							textShadow:
								'0 1px 0 #003a0e, 0 2px 0 #002a08, 0 3px 0 #001a04, 0 4px 0 #000a02, 0 5px 0 #000501, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,255,65,.3), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
							transform: `perspective(500px) rotateX(${
								Math.sin(phase * 0.5) * 3
							}deg)`,
							transition: 'transform 0.5s ease-out',
						}}
					>
						ANURAG BASURI
						<span
							className="text-[#0088ff]"
							style={{
								textShadow:
									'0 1px 0 #001a33, 0 2px 0 #001028, 0 3px 0 #000a1a, 0 4px 0 #00050d, 0 5px 0 #000306, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,136,255,.3), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
							}}
						>
							• PORTFOLIO
						</span>
					</div>

					{/* Status with glow */}
					<div
						className="text-lg sm:text-xl md:text-2xl tracking-wider opacity-80 uppercase"
						style={{ textShadow: '0 0 8px #00ff4150' }}
					>
						{status}
					</div>

					{/* Progress Bar */}
					<div className="w-full max-w-md mx-auto">
						<div className="h-3 md:h-4 bg-linear-to-r from-[#001a0d] to-[#000a05] overflow-hidden border-2 border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-sm">
							<div
								className="h-full bg-linear-to-r from-[#00ff41] via-[#00cc33] to-[#00aa22] transition-all duration-300 ease-out relative shadow-[0_0_10px_rgba(0,255,65,0.6)]"
								style={{ width: `${progress}%` }}
							>
								<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
								<div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent" />
							</div>
						</div>
					</div>

					{/* Progress Percentage */}
					<div className="text-sm md:text-base opacity-70 font-mono tabular-nums tracking-wider">
						<span className="text-[#00ff41]">[</span>
						{progress.toString().padStart(3, '0')}%
						<span className="text-[#00ff41]">]</span>{' '}
						<span className="animate-pulse">BOOTING...</span>
					</div>

					{/* Phase indicator dots */}
					<div className="flex gap-4 justify-center">
						{[0, 1, 2, 3].map(p => (
							<div key={p} className="relative">
								<div
									className={`w-4 h-4 border-2 transition-all duration-500 ${
										phase >= p
											? 'border-[#00ff41] bg-[#00ff41] shadow-[0_0_12px_#00ff41]'
											: 'border-[#003311] bg-transparent'
									}`}
									style={{ transform: phase >= p ? 'scale(1.2)' : 'scale(1)' }}
								/>
								{phase === p && (
									<div className="absolute inset-0 border-2 border-[#00ff41] animate-ping opacity-75" />
								)}
							</div>
						))}
					</div>

					{/* System info (bio-aligned) */}
					<div className="text-xs opacity-70 space-y-1 hidden md:block">
						<div>CSE UNDERGRAD • FULL-STACK + MACHINE INTELLIGENCE</div>
						<div>NEXT.JS • MERN • AI/ML • LLMs • NLP</div>
						<div>LeetCode 450+ • Consistency that compounds</div>
						<div>Building: Intelligence + UX • Learning: Advanced ML/NLP</div>
						<div>Open to Internships & Freelancing • Real impact over just code</div>
						<div>
							STATUS:{' '}
							{phase === 3 ? 'READY TO COLLABORATE' : 'PREPARING MEANINGFUL WORK'}
						</div>
					</div>

					{/* CTAs (shown after 50% progress for subtle reveal) */}
					<div
						className={`flex gap-4 justify-center pt-2 pointer-events-auto transition-opacity duration-500 ${
							progress >= 50 ? 'opacity-100' : 'opacity-0'
						}`}
					>
						<a
							href="https://www.linkedin.com/in/anurag-basuri"
							target="_blank"
							rel="noopener noreferrer"
							className="px-4 py-2 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all duration-300 text-xs md:text-sm font-bold uppercase tracking-wider backdrop-blur-sm"
							aria-label="Connect on LinkedIn"
							title="Connect on LinkedIn"
						>
							CONNECT
						</a>
						<a
							href="/projects"
							className="px-4 py-2 border-2 border-[#0088ff] text-[#0088ff] hover:bg-[#0088ff] hover:text-black transition-all duration-300 text-xs md:text-sm font-bold uppercase tracking-wider backdrop-blur-sm"
							aria-label="View Projects"
							title="View Projects"
						>
							VIEW PROJECTS
						</a>
					</div>
				</div>
			</div>

			{/* Skip button */}
			<button
				onClick={handleSkip}
				className="absolute bottom-6 right-6 md:bottom-8 md:right-8 px-4 py-2 md:px-6 md:py-3 bg-black/50 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:scale-105 transition-all duration-300 uppercase tracking-wider text-xs md:text-sm pointer-events-auto z-20 font-bold backdrop-blur-sm"
				style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)' }}
				aria-label="Skip boot animation"
			>
				SKIP BOOT <span className="ml-1">›</span>
			</button>

			{/* Scanline effect */}
			<div className="scanlines pointer-events-none absolute inset-0 z-30" />
		</div>
	);
}
