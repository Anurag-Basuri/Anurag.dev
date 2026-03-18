'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '../atoms';
import { BOOT_CONFIG, BOOT_PHASES } from '../constants';

const { PHASE_DURATION, COMPLETE_DELAY } = BOOT_CONFIG;

// ============================================================================
// Types
// ============================================================================

interface UseBootSequenceReturn {
	status: string;
	progress: number;
	isCompleting: boolean;
	skip: () => void;
}

// ============================================================================
// Hook — animates boot phases via requestAnimationFrame (no gsap)
// ============================================================================

export function useBootSequence(): UseBootSequenceReturn {
	const [, setBootComplete] = useAtom(bootCompleteAtom);
	const [status, setStatus] = useState('INITIALIZING...');
	const [progress, setProgress] = useState(0);
	const [isCompleting, setIsCompleting] = useState(false);

	const cancelledRef = useRef(false);
	const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const completeBoot = useCallback(() => {
		if (isCompleting || cancelledRef.current) return;
		setIsCompleting(true);
		setProgress(100);

		completionTimeoutRef.current = setTimeout(() => {
			setBootComplete(true);
		}, COMPLETE_DELAY);
	}, [isCompleting, setBootComplete]);

	const skip = useCallback(() => {
		if (isCompleting) return;
		cancelledRef.current = true;
		setIsCompleting(true);
		setProgress(100);
		setBootComplete(true);
	}, [isCompleting, setBootComplete]);

	// Keyboard and touch skip handler
	useEffect(() => {
		const mountTime = Date.now();
		const handleInteraction = (event: KeyboardEvent | MouseEvent | TouchEvent) => {
			// Prevent phantom skipped events (e.g., the exact click that triggered the boot sequence bubbling)
			if (Date.now() - mountTime < 400) return;

			const isSkipKey = event.type === 'keydown' && (
				[' ', 'Enter', 'Escape'].includes((event as KeyboardEvent).key) || 
				(event as KeyboardEvent).code === 'Space'
			);

			if (event.type === 'mousedown' || event.type === 'touchstart' || isSkipKey) {
				// Don't prevent default on clicks/touches, only on handled keys
				if (event.type === 'keydown') event.preventDefault();
				skip();
			}
		};
		window.addEventListener('keydown', handleInteraction as EventListener);
		window.addEventListener('mousedown', handleInteraction as EventListener);
		window.addEventListener('touchstart', handleInteraction as EventListener, { passive: true });
		
		return () => {
			window.removeEventListener('keydown', handleInteraction as EventListener);
			window.removeEventListener('mousedown', handleInteraction as EventListener);
			window.removeEventListener('touchstart', handleInteraction as EventListener);
		};
	}, [skip]);

	// Phase animation via requestAnimationFrame
	useEffect(() => {
		const totalDuration = PHASE_DURATION * BOOT_PHASES.length * 1000; // convert s -> ms
		let startTime: number | null = null;
		let rafId: number;

		const animate = (timestamp: number) => {
			if (cancelledRef.current) return;
			if (!startTime) startTime = timestamp;

			const elapsed = timestamp - startTime;
			const overallProgress = Math.min(1, elapsed / totalDuration);

			// Determine current phase
			const phaseIndex = Math.min(
				BOOT_PHASES.length - 1,
				Math.floor(overallProgress * BOOT_PHASES.length),
			);
			setStatus(BOOT_PHASES[phaseIndex]!.status);
			setProgress(Math.floor(overallProgress * 100));

			if (overallProgress < 1) {
				rafId = requestAnimationFrame(animate);
			} else {
				completeBoot();
			}
		};

		rafId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(rafId);
		};
	}, [completeBoot]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, []);

	return { status, progress, isCompleting, skip };
}
