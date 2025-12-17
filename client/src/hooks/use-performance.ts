import { useEffect } from 'react';

export function usePerformanceMonitoring() {
	useEffect(() => {
		if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

		// Log performance metrics
		window.addEventListener('load', () => {
			setTimeout(() => {
				const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

				console.log('🚀 Performance Metrics:', {
					'DOM Content Loaded': `${Math.round(
						perfData.domContentLoadedEventEnd - perfData.fetchStart,
					)}ms`,
					'Page Load': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
					'First Paint': `${Math.round(
						performance.getEntriesByType('paint')[0]?.startTime || 0,
					)}ms`,
					'DNS Lookup': `${Math.round(
						perfData.domainLookupEnd - perfData.domainLookupStart,
					)}ms`,
					'TCP Connection': `${Math.round(
						perfData.connectEnd - perfData.connectStart,
					)}ms`,
					'Server Response': `${Math.round(
						perfData.responseEnd - perfData.requestStart,
					)}ms`,
				});
			}, 0);
		});
	}, []);
}
