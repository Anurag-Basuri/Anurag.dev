'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import gsap from 'gsap';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Code, Smartphone, Rocket, Brain, Terminal } from 'lucide-react';

// Constants
const BOOT_SESSION_KEY = 'anurag-portfolio-boot';
const ANIMATION_DURATION = 1.6; // Slightly longer for dramatic effect
const BURST_DELAY = 400;
// Sanskrit characters from tech terms: संगणक, दत्त, यंत्र, तर्क, जाल, संकेत, विधि, स्मृति
// Mixed with some binary for the hacker feel
const MATRIX_CHARS = 'संगणकदात्तयंत्रतर्कजालसंकेतविधिस्मृति01';
const MATRIX_FONT_SIZE = 14;
const MATRIX_INTERVAL = 50;
const PARTICLE_COUNT = 60;

const BOOT_PHASES = [
	{ label: 'YANTRA', status: 'INITIALIZING YANTRA...' },
	{ label: 'SMRITI', status: 'ALLOCATING MEMORY...' },
	{ label: 'TARK', status: 'LOADING LOGIC MODULES...' },
	{ label: 'JAL', status: 'CONNECTING TO NETWORK...' },
	{ label: 'READY', status: 'SYSTEM READY' },
] as const;

const ROLES = [
	'Full Stack Developer',
	'AI and ML Enthusiast',
	'Problem Solver',
	'Creative Technologist',
];

// --- Sub-components ---

const MatrixRain = memo(function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d', { alpha: false });
		if (!ctx) return;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener('resize', resize);

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

			ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'; // Slightly more trail
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#059669';
			// Using a font that likely supports Devanagari
			ctx.font = `${MATRIX_FONT_SIZE}px "Geist Mono", "Noto Sans Devanagari", monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
				// Random brightness for "glint" effect
				if (Math.random() > 0.98) {
					ctx.fillStyle = '#6ee7b7'; // Brighter emerald
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
					ctx.fillStyle = '#059669'; // Reset
				} else {
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
				}

				if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.975)
					drops[i] = 0;
				drops[i]++;
			}
			animRef.current = requestAnimationFrame(draw);
		};
		animRef.current = requestAnimationFrame(draw);
		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current);
			window.removeEventListener('resize', resize);
		};
	}, []);

	return (
		<canvas ref={canvasRef} className="absolute inset-0 opacity-[0.12]" aria-hidden="true" />
	);
});

const HexGrid = memo(function HexGrid({ opacity }: { opacity: number }) {
	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
			style={{ opacity: opacity * 0.2 }}
			aria-hidden="true"
		>
			<div className="w-full h-full bg-[radial-gradient(#10b98115_1px,transparent_1px)] bg-size-[32px_32px]" />
		</div>
	);
});

// 3D Tilt Card Component
const TiltCard = ({ children }: { children: React.ReactNode }) => {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
	const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

	const rotateX = useTransform(mouseY, [-0.5, 0.5], ['15deg', '-15deg']);
	const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-15deg', '15deg']);

	const handleMouseMove = (e: React.MouseEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseXPct = (e.clientX - rect.left) / width - 0.5;
		const mouseYPct = (e.clientY - rect.top) / height - 0.5;
		x.set(mouseXPct);
		y.set(mouseYPct);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	return (
		<motion.div
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				rotateX,
				rotateY,
				transformStyle: 'preserve-3d',
			}}
			className="relative z-20 cursor-default px-4 w-full flex justify-center"
		>
			<div className="bg-black/60 backdrop-blur-xl border border-emerald-500/20 p-8 sm:p-14 rounded-2xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden group w-full max-w-xl">
				{/* Inner Glow */}
				<div
					className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
					style={{ transform: 'translateZ(1px)' }}
				/>

				{/* Content Lifted in 3D */}
				<div style={{ transform: 'translateZ(30px)' }}>{children}</div>
			</div>
		</motion.div>
	);
};

// Typewriter Component
const Typewriter = ({ texts }: { texts: string[] }) => {
	const [index, setIndex] = useState(0);
	const [displayText, setDisplayText] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const currentText = texts[index];
		const speed = isDeleting ? 30 : 50;
		const delay = isDeleting ? 0 : 2000;

		const timeout = setTimeout(() => {
			if (!isDeleting && displayText === currentText) {
				setTimeout(() => setIsDeleting(true), delay);
			} else if (isDeleting && displayText === '') {
				setIsDeleting(false);
				setIndex(prev => (prev + 1) % texts.length);
			} else {
				setDisplayText(
					currentText.substring(0, displayText.length + (isDeleting ? -1 : 1)),
				);
			}
		}, speed);

		return () => clearTimeout(timeout);
	}, [displayText, isDeleting, index, texts]);

	return (
		<span className="inline-block text-emerald-400 font-bold min-h-[1.5em]">
			{displayText}
			<span className="animate-pulse ml-1 inline-block w-2.5 h-4 bg-emerald-500 align-middle"></span>
		</span>
	);
};

// Interactive Particle Field
const InteractiveParticles = memo(function InteractiveParticles() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mouseRef = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;

		const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
		for (let i = 0; i < 40; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.3, // Slower natural movement
				vy: (Math.random() - 0.5) * 0.3,
				size: Math.random() * 2 + 0.5,
			});
		}

		const handleMove = (e: MouseEvent) => {
			mouseRef.current = { x: e.clientX, y: e.clientY };
		};
		window.addEventListener('mousemove', handleMove);

		let animationFrame: number;

		const animate = () => {
			if (!ctx || !canvas) return;
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = '#10b981';

			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;

				const dx = mouseRef.current.x - p.x;
				const dy = mouseRef.current.y - p.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				// Gentle repulsion
				if (distance < 200) {
					const angle = Math.atan2(dy, dx);
					const force = (200 - distance) / 200;
					p.vx -= Math.cos(angle) * force * 0.05; // Smoother force
					p.vy -= Math.sin(angle) * force * 0.05;
				}

				if (p.x < 0 || p.x > width) p.vx *= -1;
				if (p.y < 0 || p.y > height) p.vy *= -1;

				// Friction to prevent indefinite acceleration
				p.vx *= 0.99;
				p.vy *= 0.99;

				ctx.globalAlpha = Math.max(0.05, 1 - distance / 250) * 0.5;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			});

			ctx.strokeStyle = '#10b981';
			particles.forEach((p, i) => {
				for (let j = i + 1; j < particles.length; j++) {
					const p2 = particles[j];
					const dx = p.x - p2.x;
					const dy = p.y - p2.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < 150) {
						ctx.globalAlpha = (1 - dist / 150) * 0.1;
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.stroke();
					}
				}
			});

			animationFrame = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			window.removeEventListener('mousemove', handleMove);
			cancelAnimationFrame(animationFrame);
		};
	}, []);

	return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
});

// Glitch Text Effect
const GlitchText = ({ text }: { text: string }) => {
	const [displayText, setDisplayText] = useState(text);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

		const scramble = () => {
			let iterations = 0;
			clearInterval(interval);

			interval = setInterval(() => {
				setDisplayText(prev =>
					text
						.split('')
						.map((char, index) => {
							if (index < iterations) return text[index];
							return chars[Math.floor(Math.random() * chars.length)];
						})
						.join(''),
				);

				if (iterations >= text.length) clearInterval(interval);
				iterations += 1 / 3;
			}, 30);
		};

		const randomTrigger = setInterval(() => {
			if (Math.random() > 0.85) scramble();
		}, 3000);

		scramble();

		return () => {
			clearInterval(interval);
			clearInterval(randomTrigger);
		};
	}, [text]);

	return <span>{displayText}</span>;
};

export function BootAnimation() {
	const [, setBootComplete] = useAtom(bootCompleteAtom);
	const [status, setStatus] = useState('INITIALIZING...');
	const [progress, setProgress] = useState(0);
	const [isCompleting, setIsCompleting] = useState(false);

	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const completeBoot = useCallback(() => {
		if (isCompleting) return;
		setIsCompleting(true);
		setProgress(100);

		completionTimeoutRef.current = setTimeout(() => {
			try {
				sessionStorage.setItem(BOOT_SESSION_KEY, '1');
			} catch (e) {}
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

	useEffect(() => {
		const timeline = gsap.timeline({ onComplete: completeBoot });
		timelineRef.current = timeline;

		BOOT_PHASES.forEach((bootPhase, index) => {
			const progressStart = (index / BOOT_PHASES.length) * 100;
			const progressRange = 100 / BOOT_PHASES.length;

			timeline.to(
				{},
				{
					duration: ANIMATION_DURATION,
					onStart: () => setStatus(bootPhase.status),
					onUpdate: function () {
						const phaseProgress = this.progress();
						setProgress(
							Math.min(
								100,
								Math.floor(progressStart + phaseProgress * progressRange),
							),
						);
					},
					ease: 'power1.inOut',
				},
			);
		});

		return () => {
			timeline.kill();
		};
	}, [completeBoot]);

	useEffect(() => {
		return () => {
			if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
		};
	}, []);

	return (
		<motion.div
			className="fixed inset-0 z-50 bg-[#020202] text-emerald-500 font-mono overflow-hidden cursor-default flex items-center justify-center"
			aria-label="Booting Portfolio"
			initial={{ opacity: 1 }}
			exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
			transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-emerald-900/15 via-[#020202] to-black opacity-90" />
			<MatrixRain />
			<HexGrid opacity={isCompleting ? 0 : 1} />

			<div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
				<TiltCard>
					<div className="flex flex-col items-center text-center">
						{/* Icons */}
						<div className="flex gap-6 mb-8 text-emerald-500/60">
							<Terminal className="w-6 h-6 animate-pulse" />
							<Rocket className="w-6 h-6 text-emerald-400" />
							<Brain className="w-6 h-6" />
						</div>

						{/* Main Title */}
						<div className="flex flex-col items-center gap-2 mb-4">
							<h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white/90 uppercase">
								Anurag&apos;s
							</h1>
							<div className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-gradient-x">
								<GlitchText text="PORTFOLIO" />
							</div>
						</div>

						{/* Cycling Intro */}
						<div className="h-8 sm:h-10 mb-8 sm:mb-12 flex items-center justify-center">
							<p className="text-sm sm:text-lg font-medium tracking-[0.2em] uppercase text-emerald-500/80">
								<Typewriter texts={ROLES} />
							</p>
						</div>

						{/* Divider */}
						<div className="w-24 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent mb-10" />

						{/* Progress Bar */}
						<div className="w-full max-w-xs space-y-4">
							<div className="flex justify-between text-[11px] font-bold tracking-[0.15em] text-emerald-500/60 uppercase font-mono">
								<span className="w-24 text-left truncate">{status}</span>
								<span>{progress}%</span>
							</div>
							<div className="h-1 w-full bg-emerald-950/50 rounded-full overflow-hidden border border-emerald-500/10">
								<motion.div
									className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					</div>
				</TiltCard>

				{/* Skip Instructions */}
				<motion.div
					className="absolute bottom-[-100px] sm:bottom-[-120px] w-full flex flex-col items-center gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5, duration: 1 }}
				>
					<button
						onClick={handleSkipClick}
						className="group flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300"
					>
						<span className="text-[10px] font-bold tracking-widest text-emerald-500/70 group-hover:text-emerald-400 uppercase">
							Skip Sequence
						</span>
						<span className="text-xs text-emerald-500/40 group-hover:text-emerald-400 mb-0.5">
							↵
						</span>
					</button>
					<p className="text-[10px] text-emerald-500/20 font-mono tracking-widest uppercase">
						Press [SPACE] to Initialize
					</p>
				</motion.div>
			</div>
		</motion.div>
	);
}
