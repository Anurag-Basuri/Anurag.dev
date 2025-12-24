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

// Industry-grade ResizeHandle with creative interactions
function ResizeHandle({ className, id, onDoubleClick }: ResizeHandleProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);
	const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

	// Show tooltip after brief hover
	useEffect(() => {
		if (isHovered && !isDragging) {
			const timer = setTimeout(() => setShowTooltip(true), 500);
			return () => clearTimeout(timer);
		} else {
			setShowTooltip(false);
		}
	}, [isHovered, isDragging]);

	// Generate particle effect on drag
	const handleDragStart = useCallback(() => {
		setIsDragging(true);
		// Create particle burst
		const newParticles = Array.from({ length: 6 }, (_, i) => ({
			id: Date.now() + i,
			x: Math.random() * 20 - 10,
			y: Math.random() * 20 - 10,
		}));
		setParticles(newParticles);
	}, []);

	const handleDragEnd = useCallback(() => {
		setIsDragging(false);
		setParticles([]);
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
				// Base structure
				'group relative flex items-center justify-center z-20',
				'backdrop-blur-sm',
				'transition-all duration-300 ease-out',

				// v4 API: aria-orientation for direction
				'aria-[orientation=vertical]:w-5 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',
				'aria-[orientation=horizontal]:h-5 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',

				// v4 API: data-separator state styling
				'data-[separator=inactive]:bg-transparent',
				'data-[separator=hover]:bg-emerald-500/10',
				'data-[separator=drag]:bg-emerald-500/20',

				className,
			)}
		>
			{/* Animated particles */}
			<AnimatePresence>
				{particles.map(particle => (
					<motion.div
						key={particle.id}
						initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
						animate={{
							opacity: 0,
							scale: 0,
							x: particle.x,
							y: particle.y,
						}}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.6, ease: 'easeOut' }}
						className="absolute w-1 h-1 rounded-full bg-emerald-400 pointer-events-none"
						style={{
							boxShadow: '0 0 8px rgba(52, 211, 153, 0.8)',
						}}
					/>
				))}
			</AnimatePresence>

			{/* Primary grip line with enhanced glow */}
			<motion.div
				animate={{
					scale: isDragging ? 1.2 : isHovered ? 1.1 : 1,
					opacity: isDragging ? 1 : isHovered ? 0.9 : 0.7,
				}}
				transition={{ type: 'spring', stiffness: 400, damping: 25 }}
				className={cn(
					'absolute rounded-full',
					'bg-linear-to-r from-transparent via-white/20 to-transparent',

					// Size based on orientation and state
					'aria-[orientation=vertical]:w-0.5 aria-[orientation=vertical]:h-16',
					'aria-[orientation=horizontal]:h-0.5 aria-[orientation=horizontal]:w-16',

					// Enhanced glow
					isDragging &&
						'via-emerald-300/80 shadow-[0_0_24px_rgba(52,211,153,0.8),0_0_48px_rgba(52,211,153,0.4)]',
					isHovered &&
						!isDragging &&
						'via-emerald-400/60 shadow-[0_0_16px_rgba(52,211,153,0.6)]',
				)}
			/>

			{/* Four-dot grip indicator with shimmer */}
			<AnimatePresence>
				{(isHovered || isDragging) && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.2 }}
						className={cn(
							'absolute flex gap-1',
							'aria-[orientation=vertical]:flex-col',
							'aria-[orientation=horizontal]:flex-row',
						)}
					>
						{[0, 1, 2].map(i => (
							<motion.div
								key={i}
								animate={{
									scale: isDragging ? [1, 1.3, 1] : 1,
									opacity: isDragging ? [0.8, 1, 0.8] : 1,
								}}
								transition={{
									duration: 0.8,
									repeat: isDragging ? Infinity : 0,
									delay: i * 0.1,
								}}
								className={cn(
									'w-1.5 h-1.5 rounded-full',
									'bg-linear-to-br from-emerald-400 to-emerald-500',
									'shadow-[0_0_8px_rgba(52,211,153,0.8)]',
								)}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Directional arrow hint */}
			<AnimatePresence>
				{isHovered && !isDragging && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 0.6, scale: 1 }}
						exit={{ opacity: 0, scale: 0.5 }}
						transition={{ delay: 0.3 }}
						className={cn(
							'absolute pointer-events-none',
							'text-emerald-400 text-xs font-bold',
						)}
					>
						⇄
					</motion.div>
				)}
			</AnimatePresence>

			{/* Tooltip showing interaction hint */}
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						className={cn(
							'absolute z-50 px-2 py-1 rounded-md',
							'bg-black/90 backdrop-blur-xl',
							'border border-emerald-500/30',
							'text-xs text-emerald-300 font-medium whitespace-nowrap',
							'pointer-events-none',
							'aria-[orientation=vertical]:top-2 aria-[orientation=vertical]:left-full aria-[orientation=vertical]:ml-2',
							'aria-[orientation=horizontal]:left-2 aria-[orientation=horizontal]:top-full aria-[orientation=horizontal]:mt-2',
						)}
					>
						Double-click to reset
					</motion.div>
				)}
			</AnimatePresence>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
