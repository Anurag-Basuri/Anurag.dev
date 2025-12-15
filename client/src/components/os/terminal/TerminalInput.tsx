'use client';

import { forwardRef, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { TerminalInputProps } from './types';

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
	(
		{
			input,
			cursorPos,
			isFocused,
			onInputChange,
			onKeyDown,
			onInputSelect,
			onFocus,
			onBlur,
			currentPath,
		},
		ref,
	) => {
		const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		});

		useEffect(() => {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

			const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
			mediaQuery.addEventListener('change', handler);
			return () => mediaQuery.removeEventListener('change', handler);
		}, []);

		const handleContainerClick = useCallback(() => {
			(ref as React.RefObject<HTMLInputElement | null>)?.current?.focus();
		}, [ref]);

		return (
			<div
				className={cn(
					'min-h-[44px] sm:h-10 px-2 sm:px-1 border-t bg-card/60 backdrop-blur-xl shrink-0 flex items-center gap-2.5 cursor-text transition-all duration-200',
					isFocused ? 'border-primary/30 bg-card/70' : 'border-border/60',
				)}
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal command input"
			>
				{/* Prompt Icon */}
				<ChevronRight
					className={cn(
						'w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0 transition-all duration-300 drop-shadow',
						isFocused
							? 'text-emerald-400 scale-110'
							: 'text-muted-foreground/40 scale-100',
					)}
					aria-hidden="true"
				/>

				{/* Path */}
				<span
					className={cn(
						'text-xs font-mono shrink-0 font-medium transition-all duration-300',
						isFocused
							? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
							: 'text-primary/80',
					)}
					aria-label={`Current path: ${currentPath}`}
				>
					{currentPath}
				</span>

				<span
					className="text-xs text-muted-foreground/40 shrink-0 font-medium"
					aria-hidden="true"
				>
					$
				</span>

				{/* Input Area */}
				<div className="relative flex-1 min-w-0">
					<input
						ref={ref}
						type="text"
						value={input}
						onChange={onInputChange}
						onKeyDown={onKeyDown}
						onSelect={onInputSelect}
						onFocus={onFocus}
						onBlur={onBlur}
						className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none font-mono text-xs sm:text-sm"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
						role="textbox"
						aria-label="Command input"
						aria-describedby="terminal-help"
						aria-autocomplete="list"
						enterKeyHint="enter"
						inputMode="text"
					/>
					<div
						className={cn(
							'whitespace-pre text-xs sm:text-sm font-mono leading-tight transition-all duration-200 pointer-events-none',
							isFocused
								? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]'
								: 'text-foreground',
						)}
						aria-hidden="true"
					>
						<span>{input.substring(0, cursorPos)}</span>
						<span
							className={cn(
								'inline-block w-[2px] h-4 align-middle rounded-full transition-all duration-150',
								isFocused
									? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]'
									: 'bg-muted-foreground/20 opacity-40',
								isFocused && !prefersReducedMotion && 'animate-blink',
							)}
							role="presentation"
						/>
						<span>{input.substring(cursorPos)}</span>
					</div>
				</div>

				{/* Screen reader help text */}
				<div id="terminal-help" className="sr-only">
					Type commands and press Enter to execute. Press Tab for autocomplete, Up/Down
					arrows for command history.
				</div>
			</div>
		);
	},
);

TerminalInput.displayName = 'TerminalInput';
