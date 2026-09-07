'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '../atoms';
import { BOOT_CONFIG } from '../constants';

const { BOOT_DURATION, COMPLETE_DELAY } = BOOT_CONFIG;

// Session key to remember if boot has been seen this session
const BOOT_SEEN_KEY = 'boot_seen';

// ============================================================================
// Types
// ============================================================================

interface UseBootSequenceReturn {
	progress: number;
	isCompleting: boolean;
	skip: () => void;
}

// ============================================================================
// Hook — minimal boot progress via requestAnimationFrame
// ============================================================================

export function useBootSequence(): UseBootSequenceReturn {
	const [, setBootComplete] = useAtom(bootCompleteAtom);
	const [progress, setProgress] = useState(0);
	const [isCompleting, setIsCompleting] = useState(false);

	const cancelledRef = useRef(false);
	const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Check if boot was already seen this session — instant skip
	useEffect(() => {
		try {
			if (sessionStorage.getItem(BOOT_SEEN_KEY)) {
				setBootComplete(true);
				return;
			}
		} catch {
			// sessionStorage may be unavailable (e.g., private browsing edge cases)
		}
	}, [setBootComplete]);

	const completeBoot = useCallback(() => {
		if (isCompleting || cancelledRef.current) return;
		setIsCompleting(true);
		setProgress(100);

		// Mark boot as seen for this session
		try {
			sessionStorage.setItem(BOOT_SEEN_KEY, '1');
		} catch {
			// Ignore storage errors
		}

		completionTimeoutRef.current = setTimeout(() => {
			setBootComplete(true);
		}, COMPLETE_DELAY);
	}, [isCompleting, setBootComplete]);

	const skip = useCallback(() => {
		if (isCompleting) return;
		cancelledRef.current = true;
		setIsCompleting(true);
		setProgress(100);

		// Mark boot as seen for this session
		try {
			sessionStorage.setItem(BOOT_SEEN_KEY, '1');
		} catch {
			// Ignore storage errors
		}

		setBootComplete(true);
	}, [isCompleting, setBootComplete]);

	// Keyboard, click, and touch skip handlers
	useEffect(() => {
		const mountTime = Date.now();
		const handleInteraction = (event: KeyboardEvent | MouseEvent | TouchEvent) => {
			// Prevent phantom events from the page load
			if (Date.now() - mountTime < 400) return;

			const isSkipKey =
				event.type === 'keydown' &&
				([' ', 'Enter', 'Escape'].includes((event as KeyboardEvent).key) ||
					(event as KeyboardEvent).code === 'Space');

			if (event.type === 'mousedown' || event.type === 'touchstart' || isSkipKey) {
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

	// Progress animation via requestAnimationFrame
	useEffect(() => {
		let startTime: number | null = null;
		let rafId: number;

		const animate = (timestamp: number) => {
			if (cancelledRef.current) return;
			if (!startTime) startTime = timestamp;

			const elapsed = timestamp - startTime;
			const overallProgress = Math.min(1, elapsed / BOOT_DURATION);

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

	return { progress, isCompleting, skip };
}
