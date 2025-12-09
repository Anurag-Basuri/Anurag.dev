import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
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
			(ref as React.RefObject<HTMLInputElement>)?.current?.focus();
		}, [ref]);

		// Handle reduced motion
		const shouldReduceMotion = useCallback(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		}, []);

		return (
			<div
				className="px-4 py-3 border-t border-white/5 bg-black/20 shrink-0"
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal input form"
			>
				<div className="flex items-center gap-2 text-sm font-mono">
					{/* Prompt */}
					<span className="select-none shrink-0" aria-hidden="true">
						<span className="text-emerald-400">❯</span>
					</span>
					
					{/* Input area */}
					<div className="relative flex-1 min-w-0">
						{/* Hidden input for text capture */}
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
							aria-label={`Terminal input at ${currentPath}`}
							aria-describedby="terminal-suggestions"
							aria-autocomplete="list"
							aria-multiline="false"
							aria-current={isFocused}
							enterKeyHint="enter"
						/>
						{/* Visible input display with blinking cursor */}
						<div
							className="whitespace-pre-wrap break-all min-h-5 text-white/90 leading-5"
							aria-hidden="true"
						>
							<span>{input.substring(0, cursorPos)}</span>
							<span
								className={cn(
									'inline-block w-2 h-4 align-text-bottom bg-emerald-400 rounded-sm',
									isFocused && !shouldReduceMotion() && 'animate-blink',
								)}
								aria-hidden="true"
							/>
							<span>{input.substring(cursorPos)}</span>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

TerminalInput.displayName = 'TerminalInput';
