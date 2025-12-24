'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
	onDoubleClick?: () => void;
}

// Industry-grade ResizeHandle with creative interactions and smooth UX
function ResizeHandle({ className, id, onDoubleClick }: ResizeHandleProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);
	const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

	// Show tooltip after brief hover
	useEffect(() => {
		if (isHovered && !isDragging) {
			const timer = setTimeout(() => setShowTooltip(true), 600);
			return () => clearTimeout(timer);
		} else {
			setShowTooltip(false);
		}
	}, [isHovered, isDragging]);

	// Generate particle effect on drag
	const handleDragStart = useCallback(() => {
		setIsDragging(true);
		// Create particle burst
		const newParticles = Array.from({ length: 8 }, (_, i) => ({
			id: Date.now() + i,
			x: (Math.random() - 0.5) * 30,
			y: (Math.random() - 0.5) * 30,
		}));
		setParticles(newParticles);
	}, []);

	const handleDragEnd = useCallback(() => {
		setIsDragging(false);
		setTimeout(() => setParticles([]), 600);
	}, []);

	return (
		<Separator
			id={id}
			onDoubleClick={onDoubleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onMouseDown={handleDragStart}
			onMouseUp={handleDragEnd}
			className={cn(
				// Base structure with better hit area
				'group relative flex items-center justify-center z-20',
				'backdrop-blur-sm',
				'transition-all duration-300 ease-out',

				// v4 API: aria-orientation for direction (larger for easier grabbing)
				'aria-[orientation=vertical]:w-5 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',
				'aria-[orientation=horizontal]:h-5 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',

				// v4 API: data-separator state styling
				'data-[separator=inactive]:bg-transparent',
				'data-[separator=hover]:bg-linear-to-r data-[separator=hover]:from-emerald-500/5 data-[separator=hover]:via-emerald-500/10 data-[separator=hover]:to-emerald-500/5',
				'data-[separator=drag]:bg-linear-to-r data-[separator=drag]:from-emerald-500/10 data-[separator=drag]:via-emerald-500/20 data-[separator=drag]:to-emerald-500/10',

				className,
			)}
		>
			{/* Animated particles with improved physics */}
			<AnimatePresence>
				{particles.map(particle => (
					<motion.div
						key={particle.id}
						initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
						animate={{
							opacity: [1, 0.8, 0],
							scale: [1, 1.2, 0],
							x: particle.x,
							y: particle.y,
						}}
						exit={{ opacity: 0 }}
						transition={{
							duration: 0.8,
							ease: [0.16, 1, 0.3, 1],
							times: [0, 0.5, 1],
						}}
						className="absolute w-1.5 h-1.5 rounded-full bg-linear-to-br from-emerald-400 to-emerald-500 pointer-events-none"
						style={{
							boxShadow:
								'0 0 10px rgba(52, 211, 153, 0.9), 0 0 20px rgba(52, 211, 153, 0.5)',
						}}
					/>
				))}
			</AnimatePresence>

			{/* Primary grip line with enhanced glow and spring physics */}
			<motion.div
				animate={{
					scale: isDragging ? 1.3 : isHovered ? 1.15 : 1,
					opacity: isDragging ? 1 : isHovered ? 0.95 : 0.6,
				}}
				transition={{
					type: 'spring',
					stiffness: 500,
					damping: 28,
					mass: 0.5,
				}}
				className={cn(
					'absolute rounded-full',
					'bg-linear-to-r from-transparent via-white/25 to-transparent',

					// Size based on orientation and state
					'aria-[orientation=vertical]:w-1 aria-[orientation=vertical]:h-20',
					'aria-[orientation=horizontal]:h-1 aria-[orientation=horizontal]:w-20',

					// Enhanced multi-layer glow
					isDragging && [
						'via-emerald-300/90',
						'shadow-[0_0_20px_rgba(52,211,153,0.9),0_0_40px_rgba(52,211,153,0.6),0_0_60px_rgba(52,211,153,0.3)]',
					],
					isHovered &&
						!isDragging && [
							'via-emerald-400/70',
							'shadow-[0_0_16px_rgba(52,211,153,0.7),0_0_32px_rgba(52,211,153,0.4)]',
						],
				)}
			/>

			{/* Four-dot grip indicator with shimmer and bounce */}
			<AnimatePresence>
				{(isHovered || isDragging) && (
					<motion.div
						initial={{ opacity: 0, scale: 0.7 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.7 }}
						transition={{
							type: 'spring',
							stiffness: 400,
							damping: 20,
						}}
						className={cn(
							'absolute flex gap-1.5',
							'aria-[orientation=vertical]:flex-col',
							'aria-[orientation=horizontal]:flex-row',
						)}
					>
						{[0, 1, 2, 3].map(i => (
							<motion.div
								key={i}
								animate={{
									scale: isDragging ? [1, 1.4, 1] : 1,
									opacity: isDragging ? [0.9, 1, 0.9] : 1,
									y: isDragging ? [0, -2, 0] : 0,
								}}
								transition={{
									duration: 1,
									repeat: isDragging ? Infinity : 0,
									delay: i * 0.08,
									ease: 'easeInOut',
								}}
								className={cn(
									'w-1.5 h-1.5 rounded-full',
									'bg-linear-to-br from-emerald-400 via-emerald-500 to-teal-500',
									'shadow-[0_0_8px_rgba(52,211,153,0.9)]',
								)}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Directional arrow hint with pulse */}
			<AnimatePresence>
				{isHovered && !isDragging && (
					<motion.div
						initial={{ opacity: 0, scale: 0.3 }}
						animate={{
							opacity: [0.5, 0.8, 0.5],
							scale: 1,
						}}
						exit={{ opacity: 0, scale: 0.3 }}
						transition={{
							opacity: {
								duration: 2,
								repeat: Infinity,
								ease: 'easeInOut',
							},
							scale: {
								type: 'spring',
								stiffness: 300,
								damping: 20,
							},
						}}
						className={cn(
							'absolute pointer-events-none',
							'text-emerald-300 text-sm font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',
						)}
					>
						⇄
					</motion.div>
				)}
			</AnimatePresence>

			{/* Premium tooltip with enhanced styling */}
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.9 }}
						transition={{
							type: 'spring',
							stiffness: 400,
							damping: 25,
						}}
						className={cn(
							'absolute z-50 px-3 py-1.5 rounded-lg',
							'bg-linear-to-r from-black/95 via-black/90 to-black/95',
							'backdrop-blur-xl',
							'border border-emerald-500/40',
							'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
							'text-xs text-emerald-200 font-medium whitespace-nowrap',
							'pointer-events-none',
							'aria-[orientation=vertical]:top-4 aria-[orientation=vertical]:left-full aria-[orientation=vertical]:ml-3',
							'aria-[orientation=horizontal]:left-4 aria-[orientation=horizontal]:top-full aria-[orientation=horizontal]:mt-3',
						)}
					>
						<span className="flex items-center gap-1.5">
							<span className="text-emerald-400">⚡</span>
							Double-click to reset
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
