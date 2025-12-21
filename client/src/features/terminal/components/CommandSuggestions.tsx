'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CommandSuggestionsProps } from '../types';
import { useCallback, useMemo } from 'react';

export function CommandSuggestions({
	suggestions,
	activeSuggestionIndex,
	onApplySuggestion,
	onSetActiveIndex,
}: CommandSuggestionsProps) {
	// Handle reduced motion
	const shouldReduceMotion = useMemo(() => {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		}
		return false;
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, suggestion: string, index: number) => {
			switch (e.key) {
				case 'Enter':
				case ' ':
					e.preventDefault();
					onApplySuggestion(suggestion);
					break;
				case 'ArrowRight':
				case 'Tab':
					e.preventDefault();
					onApplySuggestion(suggestion);
					break;
				case 'ArrowDown':
					e.preventDefault();
					if (index < suggestions.length - 1) {
						onSetActiveIndex(index + 1);
					}
					break;
				case 'ArrowUp':
					e.preventDefault();
					if (index > 0) {
						onSetActiveIndex(index - 1);
					}
					break;
				case 'Escape':
					e.preventDefault();
					onSetActiveIndex(0);
					if (typeof document !== 'undefined') {
						const input = document.querySelector(
							'input[role="textbox"][aria-autocomplete="list"]',
						) as HTMLInputElement | null;
						input?.focus();
					}
					break;
			}
		},
		[suggestions, onApplySuggestion, onSetActiveIndex],
	);

	if (suggestions.length === 0) return null;

	return (
		<div
			id="terminal-suggestions"
			role="listbox"
			aria-label="Command suggestions"
			className="flex flex-wrap gap-2 px-4 py-3 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 shadow-2xl"
		>
			<div className="flex items-center gap-2 mr-2 text-[10px] font-bold tracking-widest text-emerald-500/50 uppercase select-none">
				<span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
				Suggested
			</div>
			<AnimatePresence mode="popLayout">
				{suggestions.map((suggestion, idx) => (
					<motion.button
						key={`${suggestion}-${idx}`}
						type="button"
						tabIndex={idx === activeSuggestionIndex ? 0 : -1}
						onMouseDown={e => e.preventDefault()}
						onClick={e => {
							e.stopPropagation();
							onApplySuggestion(suggestion);
						}}
						onMouseEnter={() => onSetActiveIndex(idx)}
						onKeyDown={e => handleKeyDown(e, suggestion, idx)}
						role="option"
						aria-selected={idx === activeSuggestionIndex}
						aria-label={`Suggestion ${idx + 1} of ${suggestions.length}: ${suggestion}`}
						initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
						animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
						exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
						transition={{
							duration: shouldReduceMotion ? 0 : 0.15,
							type: 'spring',
							stiffness: 400,
							damping: 25,
						}}
						className={cn(
							'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 relative overflow-hidden group',
							idx === activeSuggestionIndex
								? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] -translate-y-px'
								: 'border-white/5 text-muted-foreground bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-foreground',
						)}
					>
						{/* Active Indicator Dot */}
						{idx === activeSuggestionIndex && (
							<motion.span
								layoutId="active-dot"
								className="absolute right-1.5 top-1.5 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"
							/>
						)}
						{suggestion}
					</motion.button>
				))}
			</AnimatePresence>
		</div>
	);
}
