'use client';

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
	start?: number;
	end: number;
	duration?: number;
	decimals?: number;
	suffix?: string;
	prefix?: string;
	triggerOnMount?: boolean;
}

/**
 * Animated spring count-up hook for telemetry stats.
 * Uses easeOutQuart interpolation for a natural, snappy count-up.
 */
export function useCountUp({
	start = 0,
	end,
	duration = 1400,
	decimals = 0,
	suffix = '',
	prefix = '',
	triggerOnMount = true,
}: UseCountUpOptions) {
	const [value, setValue] = useState(start);
	const [isAnimating, setIsAnimating] = useState(false);
	const hasAnimated = useRef(false);

	const animate = () => {
		if (hasAnimated.current) return;
		hasAnimated.current = true;
		setIsAnimating(true);

		const startTime = performance.now();

		const step = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// easeOutQuart
			const eased = 1 - Math.pow(1 - progress, 4);
			const currentVal = start + (end - start) * eased;

			setValue(currentVal);

			if (progress < 1) {
				requestAnimationFrame(step);
			} else {
				setValue(end);
				setIsAnimating(false);
			}
		};

		requestAnimationFrame(step);
	};

	useEffect(() => {
		if (triggerOnMount) {
			const timeout = setTimeout(() => {
				animate();
			}, 100);
			return () => clearTimeout(timeout);
		}
	}, [triggerOnMount, end]);

	const formatted = `${prefix}${value.toFixed(decimals)}${suffix}`;

	return { formatted, value, isAnimating, startAnimation: animate };
}
