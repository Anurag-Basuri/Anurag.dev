'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import gsap from 'gsap';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Code, Smartphone, Globe } from 'lucide-react';

// Constants
const BOOT_SESSION_KEY = 'anuragos-boot-complete';
const ANIMATION_DURATION = 1.25;
const BURST_DELAY = 400;
const MATRIX_CHARS = '01XYZπΩΣ∆';
const MATRIX_FONT_SIZE = 12;
const MATRIX_INTERVAL = 60;
const PARTICLE_COUNT = 60;

const BOOT_PHASES = [
	{ label: 'CORE', status: 'LOADING EXPERIENCE...' },
	{ label: 'ASSETS', status: 'FETCHING PORTFOLIO DATA...' },
	{ label: 'GPU', status: 'INITIALIZING 3D ENVIRONMENT...' },
	{ label: 'READY', status: 'WELCOME' },
] as const;

const ROLES = [
	'Full Stack Engineer',
	'AI and ML Enthusiast',
	'Creative Developer',
	'UI/UX Enthusiast',
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

			ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'; // Hard fade
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#059669';
			ctx.font = `${MATRIX_FONT_SIZE}px "Geist Mono", monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
				if (Math.random() > 0.98) {
					ctx.fillStyle = '#34d399';
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
					ctx.fillStyle = '#059669';
				} else {
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
				}
				if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.985)
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
		<canvas ref={canvasRef} className="absolute inset-0 opacity-[0.05]" aria-hidden="true" />
	);
});

const HexGrid = memo(function HexGrid({ opacity }: { opacity: number }) {
	return (
		<div
			className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
			style={{ opacity: opacity * 0.3 }}
			aria-hidden="true"
		>
			<div className="w-full h-full bg-[radial-gradient(#10b98115_1px,transparent_1px)] bg-size-[24px_24px]" />
		</div>
	);
});

// 3D Tilt Card Component
const TiltCard = ({ children }: { children: React.ReactNode }) => {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
	const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

	const rotateX = useTransform(mouseY, [-0.5, 0.5], ['25deg', '-25deg']);
	const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-25deg', '25deg']);

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
			className="relative z-20 cursor-default"
		>
			<div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden group">
				{/* Inner Glow */}
				<div
					className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
					style={{ transform: 'translateZ(1px)' }}
				/>

				{/* Content Lifted in 3D */}
				<div style={{ transform: 'translateZ(20px)' }}>{children}</div>

				{/* Shine Effect */}
				<motion.div
					className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%]"
					animate={{ translateX: ['200%'] }}
					transition={{ repeat: Infinity, duration: 3, delay: 1, ease: 'linear' }}
				/>
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
		<span className="inline-block min-w-[200px] text-emerald-400 font-bold">
			{displayText}
			<span className="animate-pulse">_</span>
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
		for (let i = 0; i < 50; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				size: Math.random() * 2 + 0.5,
			});
		}

		const handleMove = (e: MouseEvent) => {
			mouseRef.current = { x: e.clientX, y: e.clientY };
		};
		window.addEventListener('mousemove', handleMove);

		let animationFrame: number;

		const animate = () => {
			ctx.clearRect(0, 0, width, height);
			// Use emerald tint for particles
			ctx.fillStyle = '#10b981';

			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;

				const dx = mouseRef.current.x - p.x;
				const dy = mouseRef.current.y - p.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 200) {
					const angle = Math.atan2(dy, dx);
					const force = (200 - distance) / 200;
					p.vx -= Math.cos(angle) * force * 0.02;
					p.vy -= Math.sin(angle) * force * 0.02;
				}

				if (p.x < 0 || p.x > width) p.vx *= -1;
				if (p.y < 0 || p.y > height) p.vy *= -1;

				ctx.globalAlpha = Math.max(0.1, 1 - distance / 300);
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
					if (dist < 100) {
						ctx.globalAlpha = (1 - dist / 100) * 0.15;
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
			if (Math.random() > 0.8) scramble();
		}, 3000);

		scramble();

		return () => {
			clearInterval(interval);
			clearInterval(randomTrigger);
		};
	}, [text]);

	return <span className="font-black tracking-tight">{displayText}</span>;
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
					ease: 'power2.inOut',
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
			className="fixed inset-0 z-50 bg-[#050505] text-emerald-500 font-mono overflow-hidden cursor-move flex items-center justify-center perspective-distant"
			aria-label="Booting Portfolio"
			initial={{ opacity: 1 }}
			exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
			transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black opacity-80" />
			<MatrixRain />
			<InteractiveParticles />
			<HexGrid opacity={isCompleting ? 0 : 1} />

			<div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4">
				<TiltCard>
					<div className="flex flex-col items-center text-center">
						{/* Icons */}
						<div className="flex gap-4 mb-6 text-emerald-500/50">
							<Code className="w-5 h-5" />
							<User className="w-5 h-5 text-emerald-400" />
							<Smartphone className="w-5 h-5" />
						</div>

						{/* Main Title */}
						<h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">
							ANURAG
							<span className="text-transparent bg-clip-text bg-linear-to-tr from-emerald-400 to-cyan-400 ml-3">
								<GlitchText text="BASURI" />
							</span>
						</h1>

						{/* Cycling Intro */}
						<div className="h-6 sm:h-8 mb-8 text-sm sm:text-base font-medium tracking-widest uppercase text-emerald-500/80">
							<Typewriter texts={ROLES} />
						</div>

						{/* Divider */}
						<div className="w-12 h-1 bg-emerald-500/30 rounded-full mb-8" />

						{/* Progress Bar */}
						<div className="w-full max-w-[240px] space-y-3">
							<div className="flex justify-between text-[10px] font-bold tracking-widest text-emerald-500/60 uppercase">
								<span>{status}</span>
								<span>{progress}%</span>
							</div>
							<div className="h-0.5 w-full bg-emerald-900/40 rounded-full overflow-hidden">
								<motion.div
									className="h-full bg-linear-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					</div>
				</TiltCard>

				{/* Skip / Enter Button */}
				<motion.button
					onClick={handleSkipClick}
					className="absolute bottom-12 sm:bottom-16 group"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 2, duration: 1 }}
				>
					<div className="flex flex-col items-center gap-3">
						<div className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md group-hover:bg-white/10 group-hover:border-emerald-500/30 transition-all duration-300 shadow-[0_0_20px_-10px_rgba(16,185,129,0.5)] flex items-center gap-3">
							<span className="text-[10px] font-bold tracking-[0.2em] text-white/90 group-hover:text-white uppercase">
								Enter System
							</span>
							<span className="w-px h-3 bg-white/20" />
							<span className="text-[10px] font-mono text-emerald-500/80 group-hover:text-emerald-400">
								SPACE
							</span>
						</div>
						<div className="h-px w-0 group-hover:w-full bg-linear-to-r from-transparent via-emerald-500 to-transparent transition-all duration-500 opacity-50" />
					</div>
				</motion.button>
			</div>
		</motion.div>
	);
}
