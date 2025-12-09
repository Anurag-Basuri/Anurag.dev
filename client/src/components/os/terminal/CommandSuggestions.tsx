import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CommandSuggestionsProps } from './types';
import { useCallback } from 'react';

export function CommandSuggestions({
	suggestions,
	activeSuggestionIndex,
	onApplySuggestion,
	onSetActiveIndex,
}: CommandSuggestionsProps) {
	// Handle reduced motion
	const shouldReduceMotion = () => {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		}
		return false;
	};

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
					// Reset active suggestion and focus the terminal input to dismiss suggestions UX
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
			className="flex flex-wrap gap-1.5 text-xs pl-2"
		>
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
					initial={shouldReduceMotion() ? undefined : { opacity: 0, y: -4 }}
					animate={shouldReduceMotion() ? undefined : { opacity: 1, y: 0 }}
					exit={shouldReduceMotion() ? undefined : { opacity: 0, y: -4 }}
					transition={{ duration: shouldReduceMotion() ? 0 : 0.15 }}
					className={cn(
						'px-2.5 py-1 rounded-md border transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50',
						idx === activeSuggestionIndex
							? 'border-primary/60 text-primary bg-primary/15 shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]'
							: 'border-border/50 hover:border-border/80 text-muted-foreground hover:text-foreground bg-background/40 hover:bg-muted/40',
					)}
				>
					{suggestion}
				</motion.button>
			))}
		</div>
	);
}
