'use client';

import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store/atoms';
import gsap from 'gsap';

// Matrix Rain Effect Component
function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const chars = '01अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षज्ञ';
		const fontSize = 14;
		const columns = canvas.width / fontSize;
		const drops: number[] = [];

		for (let i = 0; i < columns; i++) {
			drops[i] = Math.random() * -100;
		}

		function draw() {
			if (!ctx || !canvas) return;

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
				drops[i]++;
			}
		}

		const interval = setInterval(draw, 50);

		return () => clearInterval(interval);
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

		for (let i = 0; i < 100; i++) {
			const angle = (Math.PI * 2 * i) / 100;
			const velocity = 2 + Math.random() * 3;
			particles.push({
				x: centerX,
				y: centerY,
				vx: Math.cos(angle) * velocity,
				vy: Math.sin(angle) * velocity,
				life: 0,
				maxLife: 60 + Math.random() * 40,
			});
		}

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

		let animId = requestAnimationFrame(draw);

		return () => cancelAnimationFrame(animId);
	}, [active]);

	if (!active) return null;
	return <canvas ref={canvasRef} className="absolute inset-0" />;
}

// Network Nodes Component
function NetworkNodes({ phase }: { phase: number }) {
	const nodeCount = 12;
	const nodes = Array.from({ length: nodeCount }, (_, i) => ({
		id: i,
		x: 20 + (i % 4) * 26,
		y: 30 + Math.floor(i / 4) * 30,
	}));

	if (phase < 2) return null;

	return (
		<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
			<svg width="100%" height="100%" className="max-w-4xl">
				{/* Connection Lines */}
				{nodes.map((node, i) =>
					nodes
						.slice(i + 1)
						.map(target => (
							<line
								key={`${node.id}-${target.id}`}
								x1={`${node.x}%`}
								y1={`${node.y}%`}
								x2={`${target.x}%`}
								y2={`${target.y}%`}
								stroke="#00ff41"
								strokeWidth="1"
								opacity="0.2"
								className="animate-pulse"
							/>
						)),
				)}

				{/* Nodes */}
				{nodes.map((node, i) => (
					<g key={node.id}>
						<circle
							cx={`${node.x}%`}
							cy={`${node.y}%`}
							r="8"
							fill="#000"
							stroke="#00ff41"
							strokeWidth="2"
							opacity="1"
							style={{
								animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
							}}
						/>
						<circle
							cx={`${node.x}%`}
							cy={`${node.y}%`}
							r="4"
							fill="#00ff41"
							opacity="0.8"
						/>
					</g>
				))}
			</svg>
		</div>
	);
}

export function BootAnimation() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [phase, setPhase] = useState(0);
	const [status, setStatus] = useState('INITIALIZING SYSTEM');
	const [progress, setProgress] = useState(0);
	const [showBurst, setShowBurst] = useState(false);
	const [hexOpacity, setHexOpacity] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// GSAP Timeline for orchestrating the boot sequence
		const tl = gsap.timeline({
			onComplete: () => {
				setShowBurst(true);
				setTimeout(() => setBootComplete(true), 1500);
			},
		});

		tl.to(
			{},
			{
				duration: 1.5,
				onStart: () => {
					setStatus('WELCOME TO MY PORTFOLIO');
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
					duration: 1.5,
					onStart: () => {
						setStatus('LOADING EXPERIENCE & PROJECTS');
						setPhase(1);
						setHexOpacity(0.5);
					},
					onUpdate: function () {
						setProgress(25 + Math.floor(this.progress() * 25));
					},
				},
			)
			.to(
				{},
				{
					duration: 1.5,
					onStart: () => {
						setStatus('INITIALIZING SKILLS & EXPERTISE');
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
					duration: 1.5,
					onStart: () => {
						setStatus('PORTFOLIO READY');
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

	const handleSkip = () => {
		setBootComplete(true);
	};

	if (bootComplete) return null;

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-9999 bg-black text-[#00ff41] font-mono overflow-hidden"
		>
			{/* Matrix Rain Background */}
			<MatrixRain />

			{/* Hex Grid */}
			<HexGrid opacity={hexOpacity} />

			{/* Network Nodes - Removed for cleaner look */}
			{/* <NetworkNodes phase={phase} /> */}

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
						ANURAG
						<span
							className="text-[#0088ff]"
							style={{
								textShadow:
									'0 1px 0 #001a33, 0 2px 0 #001028, 0 3px 0 #000a1a, 0 4px 0 #00050d, 0 5px 0 #000306, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,136,255,.3), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
							}}
						>
							OS
						</span>
					</div>

					{/* Status with glow */}
					<div
						className="text-lg sm:text-xl md:text-2xl tracking-wider opacity-75 uppercase"
						style={{
							textShadow: '0 0 8px #00ff4150',
						}}
					>
						{status}
					</div>

					{/* Progress Bar */}
					<div className="w-full max-w-md mx-auto">
						<div className="h-3 md:h-4 bg-gradient-to-r from-[#001a0d] to-[#000a05] overflow-hidden border-2 border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
							<div
								className="h-full bg-gradient-to-r from-[#00ff41] via-[#00cc33] to-[#00aa22] transition-all duration-300 ease-out relative shadow-[0_0_10px_rgba(0,255,65,0.6)]"
								style={{ width: `${progress}%` }}
							>
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
								<div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
							</div>
						</div>
					</div>

					{/* Progress Percentage */}
					<div className="text-sm md:text-base opacity-70 font-mono tabular-nums tracking-wider">
						<span className="text-[#00ff41]">[</span>
						{progress.toString().padStart(3, '0')}%
						<span className="text-[#00ff41]">]</span>{' '}
						<span className="animate-pulse">LOADING...</span>
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
									style={{
										transform: phase >= p ? 'scale(1.2)' : 'scale(1)',
									}}
								/>
								{phase === p && (
									<div className="absolute inset-0 border-2 border-[#00ff41] animate-ping opacity-75" />
								)}
							</div>
						))}
					</div>

					{/* System info */}
					<div className="text-xs opacity-40 space-y-1 hidden md:block">
						<div>FULL-STACK DEVELOPER | DESIGNER | CREATOR</div>
						<div>
							STATUS: {phase === 3 ? 'READY FOR COLLABORATION' : 'PREPARING SHOWCASE'}
						</div>
					</div>
				</div>
			</div>

			{/* Skip button */}
			<button
				onClick={handleSkip}
				className="absolute bottom-6 right-6 md:bottom-8 md:right-8 px-4 py-2 md:px-6 md:py-3 bg-black/50 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:scale-105 transition-all duration-300 uppercase tracking-wider text-xs md:text-sm pointer-events-auto z-20 font-bold backdrop-blur-sm"
				style={{
					boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
				}}
			>
				SKIP BOOT <span className="ml-1">›</span>
			</button>

			{/* Scanline effect */}
			<div className="scanlines pointer-events-none absolute inset-0 z-30" />
		</div>
	);
}
