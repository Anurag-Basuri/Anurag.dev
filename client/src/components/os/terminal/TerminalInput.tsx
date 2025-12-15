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
						'w-3.5 h-3.5 shrink-0 transition-colors',
						isFocused ? 'text-primary' : 'text-muted-foreground/40',
					)}
				/>

				{/* Path */}
				<span className="text-xs font-mono text-primary/80 shrink-0 font-medium">
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
						className="whitespace-pre text-xs font-mono text-foreground leading-tight"
						aria-hidden="true"
					>
						<span>{input.substring(0, cursorPos)}</span>
						<span
							className={cn(
								'inline-block w-[2px] h-4 align-middle rounded-full',
								isFocused ? 'bg-primary' : 'bg-muted-foreground/30',
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
