'use client';

import { forwardRef, useCallback } from 'react';
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
		const handleContainerClick = useCallback(() => {
			(ref as React.RefObject<HTMLInputElement | null>)?.current?.focus();
		}, [ref]);

		const shouldReduceMotion = useCallback(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		}, []);

		return (
			<div
				className={cn(
					'h-8 px-1 border-t bg-card/60 backdrop-blur-xl shrink-0 flex items-center gap-2.5 cursor-text transition-colors',
					isFocused ? 'border-primary/20' : 'border-border/60',
				)}
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal input"
			>
				{/* Prompt Icon */}
				<ChevronRight
					className={cn(
						'w-3.5 h-3.5 shrink-0 transition-colors drop-shadow',
						isFocused ? 'text-emerald-400' : 'text-muted-foreground/40',
					)}
				/>

				{/* Path */}
				<span
					className={cn(
						'text-xs font-mono shrink-0 font-medium transition-colors',
						isFocused
							? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
							: 'text-primary/80',
					)}
				>
					{currentPath}
				</span>

				<span className="text-xs text-muted-foreground/40 shrink-0 font-medium">$</span>

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
						className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
						role="textbox"
						aria-label="Command input"
						enterKeyHint="enter"
					/>
					<div
						className={cn(
							'whitespace-pre text-xs font-mono leading-tight transition-colors',
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
								isFocused ? 'bg-emerald-400' : 'bg-muted-foreground/20 opacity-40',
								isFocused && !shouldReduceMotion() && 'animate-blink',
							)}
						/>
						<span>{input.substring(cursorPos)}</span>
					</div>
				</div>
			</div>
		);
	},
);

TerminalInput.displayName = 'TerminalInput';
