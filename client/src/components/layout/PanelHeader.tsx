'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/design-system/tokens';

// ============================================================================
// Types
// ============================================================================

interface PanelHeaderProps {
	type: 'sidebar' | 'terminal';
	icon: LucideIcon;
	title: string;
	subtitle?: string | null;
	controls?: React.ReactNode;
	isFocused?: boolean;
	className?: string;
}

// ============================================================================
// Panel Header Component
// ============================================================================

/**
 * Unified panel header for sidebar and terminal
 * Uses centralized PANEL_TOKENS for consistent styling
 */
export function PanelHeader({
	icon: Icon,
	title,
	subtitle,
	controls,
	isFocused = false,
	className,
}: PanelHeaderProps) {
	const { header, icons, accent } = PANEL_TOKENS;

	return (
		<header
			className={cn(
				header.height,
				header.padding,
				header.bg,
				header.blur,
				header.border,
				header.shadow,
				'flex items-center justify-between',
				'shrink-0 select-none',
				'relative z-20',
				'transition-all duration-200',
				'hover:bg-white/[0.07]',
				className,
			)}
		>
			{/* Left: Controls + Icon + Title */}
			<div className="flex items-center gap-2">
				{controls}

				{/* Separator */}
				{controls && <div className="h-3.5 w-px bg-white/10" aria-hidden="true" />}

				{/* Icon + Title + Subtitle */}
				<div className="flex items-center gap-1.5 text-xs font-mono transition-colors">
					<Icon
						className={cn(
							icons.md,
							'transition-all duration-200',
							isFocused ? `text-primary ${accent.glow}` : 'text-muted-foreground',
						)}
						aria-hidden="true"
					/>

					<span
						className={cn(
							'font-semibold tracking-tight transition-colors duration-200',
							isFocused ? 'text-foreground' : 'text-muted-foreground',
						)}
					>
						{title}
					</span>

					{subtitle && (
						<>
							<span
								className={cn(
									'transition-colors duration-200',
									isFocused ? 'text-primary/70' : 'text-muted-foreground/40',
								)}
							>
								—
							</span>
							<span
								className={cn(
									'font-medium transition-colors duration-200',
									isFocused ? 'text-primary' : 'text-muted-foreground/60',
								)}
							>
								{subtitle}
							</span>
						</>
					)}
				</div>
			</div>
		</header>
	);
}

