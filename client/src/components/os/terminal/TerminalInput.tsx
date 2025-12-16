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
					'min-h-[48px] sm:h-12 px-3 sm:px-4 border-t bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 flex items-center gap-3 cursor-text transition-all duration-300 group',
					isFocused
						? 'border-emerald-500/30 bg-[#0a0a0a]/90 shadow-[0_-1px_20px_rgba(52,211,153,0.05)]'
						: 'border-white/5 hover:border-white/10 hover:bg-[#0a0a0a]/85',
				)}
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal command input"
			>
				{/* Prompt Icon */}
				<div
					className={cn(
						'flex items-center justify-center w-5 h-5 rounded transition-all duration-300',
						isFocused ? 'bg-emerald-500/10' : 'bg-transparent',
					)}
				>
					<ChevronRight
						className={cn(
							'w-4 h-4 transition-all duration-300',
							isFocused
								? 'text-emerald-400 translate-x-0.5'
								: 'text-muted-foreground/40',
						)}
						aria-hidden="true"
					/>
				</div>

				{/* Path */}
				<div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
					<span
						className={cn(
							'font-semibold tracking-wide transition-all duration-300',
							isFocused
								? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
								: 'text-muted-foreground/60 group-hover:text-muted-foreground/80',
						)}
						aria-label={`Current path: ${currentPath}`}
					>
						{currentPath}
					</span>

					<span
						className={cn(
							'font-bold transition-colors duration-300',
							isFocused ? 'text-emerald-500/80' : 'text-muted-foreground/30',
						)}
						aria-hidden="true"
					>
						$
					</span>
				</div>

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
						className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none font-mono text-xs sm:text-sm tracking-wide"
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
							'whitespace-pre text-xs sm:text-sm font-mono leading-relaxed transition-all duration-200 pointer-events-none tracking-wide flex items-center',
							isFocused ? 'text-emerald-100' : 'text-muted-foreground',
						)}
						aria-hidden="true"
					>
						<span>{input.substring(0, cursorPos)}</span>
						<span
							className={cn(
								'inline-block w-[8px] h-[18px] bg-emerald-400/90 align-middle transition-all duration-100 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
								!isFocused && 'opacity-0',
								isFocused && !prefersReducedMotion && 'animate-pulse',
							)}
							role="presentation"
						/>
						<span className="opacity-50">{input.substring(cursorPos)}</span>
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
