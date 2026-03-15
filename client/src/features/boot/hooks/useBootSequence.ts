'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import gsap from 'gsap';
import { BOOT_CONFIG, BOOT_PHASES } from './constants';

const { PHASE_DURATION, COMPLETE_DELAY } = BOOT_CONFIG;

// ============================================================================
// Types
// ============================================================================

interface UseBootSequenceReturn {
	// Current boot phase status message
	status: string;
	// Progress percentage (0-100)
	progress: number;
	// Whether the boot sequence is in the final completion phase
	isCompleting: boolean;
	// Function to skip the boot sequence immediately
	skip: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

// Custom hook that manages the boot sequence animation. Handles GSAP timeline for phase transitions, progress state updates, and provides skip functionality via keyboard or button.
// @returns Boot sequence state and controls
// @example
// ```tsx
// const { status, progress, isCompleting, skip } = useBootSequence();
// ```
export function useBootSequence(): UseBootSequenceReturn {
	const [, setBootComplete] = useAtom(bootCompleteAtom);
	const [status, setStatus] = useState('INITIALIZING...');
	const [progress, setProgress] = useState(0);
	const [isCompleting, setIsCompleting] = useState(false);

	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const completeBoot = useCallback(() => {
		if (isCompleting) return;
		setIsCompleting(true);
		setProgress(100);

		completionTimeoutRef.current = setTimeout(() => {
			setBootComplete(true);
		}, COMPLETE_DELAY);
	}, [isCompleting, setBootComplete]);

	const skip = useCallback(() => {
		timelineRef.current?.kill();
		completeBoot();
	}, [completeBoot]);

	// Keyboard skip handler
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if ([' ', 'Enter', 'Escape'].includes(event.key)) {
				event.preventDefault();
				skip();
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [skip]);

	// GSAP Timeline
	useEffect(() => {
		const timeline = gsap.timeline({ onComplete: completeBoot });
		timelineRef.current = timeline;

		BOOT_PHASES.forEach((phase, index) => {
			const progressStart = (index / BOOT_PHASES.length) * 100;
			const progressRange = 100 / BOOT_PHASES.length;

			timeline.to(
				{},
				{
					duration: PHASE_DURATION,
					onStart: () => setStatus(phase.status),
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
