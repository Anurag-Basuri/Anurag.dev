'use client';

import { useEffect, useRef, useState } from 'react';

// Configuration
const TRAIL_LENGTH = 26;
const BASE_AMPLITUDE = 9;
const HOVER_AMPLITUDE = 18;

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	life: number;
	maxLife: number;
}

export function CustomCursor() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (window.matchMedia('(pointer: coarse)').matches) return;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		let animationFrameId: number;
		let time = 0;
		let isHovering = false;
		let isClicking = false;
		let mouseX = -1000;
		let mouseY = -1000;
		let hasMoved = false;

		// Trail coordinates with spring physics
		const trail: { x: number; y: number }[] = Array.from(
			{ length: TRAIL_LENGTH },
			() => ({ x: -1000, y: -1000 })
		);

		// Sparkle particles
		const sparkles: Particle[] = [];

		const handleResize = () => {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = window.innerWidth * dpr;
			canvas.height = window.innerHeight * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;

			if (!hasMoved) {
				hasMoved = true;
				setIsVisible(true);
				for (let i = 0; i < TRAIL_LENGTH; i++) {
					trail[i].x = mouseX;
					trail[i].y = mouseY;
				}
			}

			// Add dynamic star dust sparkle
			if (Math.random() < 0.3) {
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 1.2 + 0.4;
				sparkles.push({
					x: mouseX + (Math.random() - 0.5) * 6,
					y: mouseY + (Math.random() - 0.5) * 6,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					size: Math.random() * 2 + 1,
					alpha: 1,
					life: 0,
					maxLife: Math.random() * 20 + 12,
				});
			}

			const target = e.target as HTMLElement | null;
			if (target) {
				const interactive = target.closest(
					'a, button, input, textarea, select, [role="button"], [data-cursor="pointer"], .cursor-pointer'
				);
				isHovering = !!interactive;
			}
		};

		const handleMouseDown = () => {
			isClicking = true;
			// Burst of cosmic sparkles on click
			for (let i = 0; i < 10; i++) {
				const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5;
				const speed = Math.random() * 2.5 + 1.5;
				sparkles.push({
					x: mouseX,
					y: mouseY,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					size: Math.random() * 2.5 + 1,
					alpha: 1,
					life: 0,
					maxLife: Math.random() * 24 + 16,
				});
			}
		};

		const handleMouseUp = () => {
			isClicking = false;
		};

		const handleMouseLeave = () => {
			setIsVisible(false);
		};

		const handleMouseEnter = () => {
			if (hasMoved) setIsVisible(true);
		};

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);

		const getThemeColor = () => {
			const root = document.documentElement;
			let color = getComputedStyle(root).getPropertyValue('--theme-primary').trim();
			if (!color) color = getComputedStyle(root).getPropertyValue('--primary').trim();
			if (!color) return '#38bdf8';
			return color;
		};

		const render = () => {
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

			if (hasMoved && mouseX > -500) {
				time += isHovering ? 0.2 : 0.12;
				const themeColor = getThemeColor();

				// Update trail points with spring interpolation
				trail[0].x = mouseX;
				trail[0].y = mouseY;

				for (let i = 1; i < TRAIL_LENGTH; i++) {
					const prev = trail[i - 1];
					const curr = trail[i];
					const factor = isHovering ? 0.45 : 0.36;
					curr.x += (prev.x - curr.x) * factor;
					curr.y += (prev.y - curr.y) * factor;
				}

				// Draw Cosmic Wavy Ribbon
				const amplitude = isHovering ? HOVER_AMPLITUDE : BASE_AMPLITUDE;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';

				for (let i = 1; i < TRAIL_LENGTH; i++) {
					const curr = trail[i];
					const prev = trail[i - 1];
					const progress = i / TRAIL_LENGTH; // 0 (head) to 1 (tail)

					// Perpendicular wave angle calculation
					let angle = 0;
					if (i < TRAIL_LENGTH - 1) {
						const dx = trail[i - 1].x - trail[i + 1].x;
						const dy = trail[i - 1].y - trail[i + 1].y;
						angle = Math.atan2(dy, dx) + Math.PI / 2;
					}

					let prevAngle = 0;
					if (i > 1) {
						const dx = trail[i - 2].x - trail[i].x;
						const dy = trail[i - 2].y - trail[i].y;
						prevAngle = Math.atan2(dy, dx) + Math.PI / 2;
					}

					// Wave modulation: envelope is 0 at cursor, peaks in middle, fades at tail
					const envelope = Math.sin(progress * Math.PI);
					const prevEnvelope = Math.sin(((i - 1) / TRAIL_LENGTH) * Math.PI);

					const waveOffset = Math.sin(time - i * 0.28) * amplitude * envelope;
					const prevWaveOffset = Math.sin(time - (i - 1) * 0.28) * amplitude * prevEnvelope;

					const x1 = prev.x + Math.cos(prevAngle) * prevWaveOffset;
					const y1 = prev.y + Math.sin(prevAngle) * prevWaveOffset;
					const x2 = curr.x + Math.cos(angle) * waveOffset;
					const y2 = curr.y + Math.sin(angle) * waveOffset;

					// Outer cosmic glow
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.shadowBlur = isHovering ? 16 : 9;
					ctx.shadowColor = themeColor;
					ctx.strokeStyle = themeColor;
					ctx.globalAlpha = Math.max(0, (1 - progress) * 0.7);
					ctx.lineWidth = Math.max(1, (1 - progress) * (isHovering ? 6.5 : 4));
					ctx.stroke();

					// Inner high-energy white core beam
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.shadowBlur = 3;
					ctx.shadowColor = '#ffffff';
					ctx.strokeStyle = '#ffffff';
					ctx.globalAlpha = Math.max(0, (1 - progress) * 0.85);
					ctx.lineWidth = Math.max(0.6, (1 - progress) * (isHovering ? 2.2 : 1.5));
					ctx.stroke();
				}

				// Render Star Dust Sparkles
				for (let i = sparkles.length - 1; i >= 0; i--) {
					const p = sparkles[i];
					p.x += p.vx;
					p.y += p.vy;
					p.vx *= 0.95;
					p.vy *= 0.95;
					p.life++;
					p.alpha = Math.max(0, 1 - p.life / p.maxLife);

					if (p.life >= p.maxLife) {
						sparkles.splice(i, 1);
						continue;
					}

					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
					ctx.fillStyle = Math.random() > 0.4 ? '#ffffff' : themeColor;
					ctx.shadowBlur = 6;
					ctx.shadowColor = themeColor;
					ctx.globalAlpha = p.alpha;
					ctx.fill();
				}

				// Draw Cosmic Head Star at pointer
				ctx.globalAlpha = 1;
				ctx.shadowBlur = isHovering ? 20 : 12;
				ctx.shadowColor = themeColor;

				// Outer aura ring
				ctx.beginPath();
				ctx.arc(mouseX, mouseY, isHovering ? 8 : (isClicking ? 12 : 5), 0, Math.PI * 2);
				ctx.fillStyle = themeColor;
				ctx.fill();

				// Bright white core
				ctx.beginPath();
				ctx.arc(mouseX, mouseY, isHovering ? 3.5 : (isClicking ? 5 : 2), 0, Math.PI * 2);
				ctx.fillStyle = '#ffffff';
				ctx.shadowBlur = 4;
				ctx.shadowColor = '#ffffff';
				ctx.fill();

				ctx.shadowBlur = 0;
			}

			animationFrameId = requestAnimationFrame(render);
		};

		animationFrameId = requestAnimationFrame(render);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mouseleave', handleMouseLeave);
			document.removeEventListener('mouseenter', handleMouseEnter);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className={`fixed inset-0 pointer-events-none z-[999999] transition-opacity duration-300 ${
				isVisible ? 'opacity-100' : 'opacity-0'
			}`}
			style={{ width: '100vw', height: '100vh' }}
			aria-hidden="true"
		/>
	);
}
