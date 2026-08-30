'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
	const dotRef = useRef<HTMLDivElement>(null);
	const ringRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [isClicking, setIsClicking] = useState(false);
	const [isTouch, setIsTouch] = useState(true);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
		if (hasCoarsePointer) {
			setIsTouch(true);
			return;
		}
		setIsTouch(false);

		let mouseX = -100;
		let mouseY = -100;
		let ringX = -100;
		let ringY = -100;
		let animationFrameId: number;

		const onMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			if (!isVisible) setIsVisible(true);

			if (dotRef.current) {
				dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
			}

			const target = e.target as HTMLElement | null;
			if (target) {
				const interactive = target.closest(
					'a, button, input, textarea, select, [role="button"], [data-cursor="pointer"], .cursor-pointer'
				);
				setIsHovering(!!interactive);
			}
		};

		const onMouseDown = () => setIsClicking(true);
		const onMouseUp = () => setIsClicking(false);
		const onMouseLeave = () => setIsVisible(false);
		const onMouseEnter = () => setIsVisible(true);

		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mouseleave', onMouseLeave);
		document.addEventListener('mouseenter', onMouseEnter);

		const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

		const render = () => {
			ringX = lerp(ringX, mouseX, 0.18);
			ringY = lerp(ringY, mouseY, 0.18);

			if (ringRef.current) {
				ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
			}
			animationFrameId = requestAnimationFrame(render);
		};

		animationFrameId = requestAnimationFrame(render);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('mouseleave', onMouseLeave);
			document.removeEventListener('mouseenter', onMouseEnter);
			cancelAnimationFrame(animationFrameId);
		};
	}, [isVisible]);

	if (isTouch) return null;

	return (
		<div
			className={`fixed inset-0 pointer-events-none z-[999999] transition-opacity duration-300 ${
				isVisible ? 'opacity-100' : 'opacity-0'
			}`}
			aria-hidden="true"
		>
			{/* Outer Smooth Trailing Ring */}
			<div
				ref={ringRef}
				className="fixed top-0 left-0 rounded-full transition-all duration-200 ease-out will-change-transform"
				style={{
					width: isHovering ? 46 : 28,
					height: isHovering ? 46 : 28,
					border: '1.5px solid var(--theme-primary)',
					backgroundColor: isHovering
						? 'color-mix(in srgb, var(--theme-primary) 12%, transparent)'
						: 'transparent',
					boxShadow: isHovering
						? '0 0 20px -3px var(--theme-primary)'
						: '0 0 10px -4px var(--theme-primary)',
					transform: `scale(${isClicking ? 0.8 : 1})`,
				}}
			/>

			{/* Inner Precision Dot */}
			<div
				ref={dotRef}
				className="fixed top-0 left-0 rounded-full transition-transform duration-100 ease-out will-change-transform"
				style={{
					width: isHovering ? 6 : 5,
					height: isHovering ? 6 : 5,
					backgroundColor: 'var(--theme-primary)',
					boxShadow: '0 0 8px 1px var(--theme-primary)',
					transform: `scale(${isClicking ? 1.4 : 1})`,
				}}
			/>
		</div>
	);
}