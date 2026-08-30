'use client';

import { useState, useRef, useCallback, type MouseEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BorderBeam } from './BorderBeam';

interface SpotlightCardProps {
	children: ReactNode;
	className?: string;
	spotlightColor?: string;
	spotlightSize?: number;
	tilt?: boolean;
	beam?: boolean;
	onClick?: () => void;
	style?: React.CSSProperties;
}

export function SpotlightCard({
	children,
	className,
	spotlightColor = 'var(--theme-primary)',
	spotlightSize = 350,
	tilt = true,
	beam = false,
	onClick,
	style,
}: SpotlightCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isHovered, setIsHovered] = useState(false);
	const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

	// Tilt physics with smooth spring
	const rawRotateX = useMotionValue(0);
	const rawRotateY = useMotionValue(0);

	const rotateX = useSpring(rawRotateX, { stiffness: 260, damping: 22, mass: 0.5 });
	const rotateY = useSpring(rawRotateY, { stiffness: 260, damping: 22, mass: 0.5 });

	// Glare reflection movement
	const glareX = useTransform(rotateY, [-10, 10], ['20%', '80%']);
	const glareY = useTransform(rotateX, [-10, 10], ['80%', '20%']);

	const handleMouseMove = useCallback(
		(e: MouseEvent<HTMLDivElement>) => {
			if (!cardRef.current) return;
			const rect = cardRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			setMousePos({ x, y });

			if (tilt) {
				const centerX = rect.width / 2;
				const centerY = rect.height / 2;
				const maxTilt = 5.5;

				const tiltX = -((y - centerY) / centerY) * maxTilt;
				const tiltY = ((x - centerX) / centerX) * maxTilt;

				rawRotateX.set(tiltX);
				rawRotateY.set(tiltY);
			}
		},
		[rawRotateX, rawRotateY, tilt]
	);

	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
		setMousePos({ x: -1000, y: -1000 });
		rawRotateX.set(0);
		rawRotateY.set(0);
	}, [rawRotateX, rawRotateY]);

	return (
		<motion.div
			ref={cardRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={onClick}
			style={{
				perspective: 1000,
				transformStyle: 'preserve-3d',
				rotateX: tilt ? rotateX : 0,
				rotateY: tilt ? rotateY : 0,
				...style,
			}}
			className={cn(
				'relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl transition-colors duration-300 overflow-hidden group',
				className
			)}
		>
			{/* Radial Background Spotlight */}
			<div
				className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
				style={{
					background: `radial-gradient(${spotlightSize}px circle at ${mousePos.x}px ${mousePos.y}px, color-mix(in srgb, ${spotlightColor} 14%, transparent), transparent 80%)`,
				}}
			/>

			{/* Dynamic Border Spotlight */}
			<div
				className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
				style={{
					border: `1.5px solid ${spotlightColor}`,
					maskImage: `radial-gradient(${spotlightSize * 0.8}px circle at ${mousePos.x}px ${mousePos.y}px, black 20%, transparent 80%)`,
					WebkitMaskImage: `radial-gradient(${spotlightSize * 0.8}px circle at ${mousePos.x}px ${mousePos.y}px, black 20%, transparent 80%)`,
				}}
			/>

			{/* 3D Glass Specular Glare */}
			{tilt && isHovered && (
				<motion.div
					className="pointer-events-none absolute inset-0 rounded-2xl opacity-15 z-20 mix-blend-overlay transition-opacity duration-300"
					style={{
						background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, white 0%, transparent 60%)`,
					}}
				/>
			)}

			{/* Optional Animated Border Beam for Featured Items */}
			{beam && <BorderBeam size={220} duration={6} colorFrom={spotlightColor} />}

			{/* Main Card Content */}
			<div className="relative z-30 h-full w-full">{children}</div>
		</motion.div>
	);
}