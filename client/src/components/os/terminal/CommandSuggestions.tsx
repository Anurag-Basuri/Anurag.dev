import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CommandSuggestionsProps } from './types';
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
			className="flex flex-wrap gap-1.5 px-3 py-2 bg-[#0d1117]/30 backdrop-blur-sm border-t border-white/5"
		>
			<span className="text-[10px] text-white/30 uppercase tracking-wider mr-1 self-center">
				Tab:
			</span>
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
							duration: shouldReduceMotion ? 0 : 0.12,
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
						className={cn(
							'px-2.5 py-1 rounded-md border text-xs font-mono transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400/50',
							idx === activeSuggestionIndex
								? 'border-emerald-400/60 text-emerald-400 bg-emerald-400/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
								: 'border-white/10 text-white/60 hover:text-white/90 bg-white/5 hover:bg-white/10 hover:border-white/20',
						)}
					>
						{suggestion}
					</motion.button>
				))}
			</AnimatePresence>
		</div>
	);
}
