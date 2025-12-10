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

		// Handle reduced motion preference
		const shouldReduceMotion = useCallback(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		}, []);

		return (
			<div
				className="h-7 px-2 border-t border-white/10 bg-[#0d1117] shrink-0 flex items-center"
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal input form"
			>
				<div className="flex items-center gap-1.5 w-full text-[11px] font-mono">
					<span className="select-none shrink-0 text-white/60" aria-hidden="true">
						<span className="text-emerald-400 font-semibold">root@anuragos</span>
						<span className="text-white/30">:</span>
						<span className="text-blue-400">{currentPath}</span>
						<span className="text-emerald-400/80 pl-0.5">$</span>
					</span>

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
						<div
							className="whitespace-pre break-all text-white/90 leading-tight"
							aria-hidden="true"
						>
							<span>{input.substring(0, cursorPos)}</span>
							<span
								className={cn(
									'inline-block w-[2px] h-3.5 align-[-0.15em] bg-emerald-400 rounded-sm',
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
