'use client';

import { memo, useEffect, useRef } from 'react';
import { BOOT_CONFIG } from '../constants';

const { MATRIX_CHARS, MATRIX_FONT_SIZE, MATRIX_INTERVAL } = BOOT_CONFIG;

// Canvas-based Matrix Rain effect
export const MatrixRain = memo(function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d', { alpha: false });
		if (!ctx) return;

		let resizeTimeout: ReturnType<typeof setTimeout>;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resize();

		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resize, 200);
		};

		window.addEventListener('resize', handleResize);

		const columns = Math.ceil(window.innerWidth / MATRIX_FONT_SIZE);
		const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);
		let lastTime = 0;

		const draw = (timestamp: number) => {
			if (!ctx || !canvas) return;

			if (timestamp - lastTime < MATRIX_INTERVAL) {
				animRef.current = requestAnimationFrame(draw);
				return;
			}
			lastTime = timestamp;

			// Trail effect
			ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#059669';
			ctx.font = `${MATRIX_FONT_SIZE}px "Geist Mono", "Noto Sans Devanagari", monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];

				// Occasional bright character
				if (Math.random() > 0.98) {
					ctx.fillStyle = '#6ee7b7';
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
					ctx.fillStyle = '#059669';
				} else {
					ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
				}

				// Reset drop when it goes off screen
				if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i]++;
			}

			animRef.current = requestAnimationFrame(draw);
		};

		animRef.current = requestAnimationFrame(draw);

		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current);
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimeout);
		};
	}, []);

	return (
		<canvas ref={canvasRef} className="absolute inset-0 opacity-[0.12]" aria-hidden="true" />
	);
});

