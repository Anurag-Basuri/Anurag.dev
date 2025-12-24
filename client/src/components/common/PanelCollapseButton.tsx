import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PanelCollapseButtonProps {
	isCollapsed: boolean;
	onToggle: () => void;
	position: 'left' | 'right' | 'top' | 'bottom';
	className?: string;
}

/**
 * Collapse/Expand button for resizable panels
 * Shows appropriate chevron based on position and state
 */
export function PanelCollapseButton({
	isCollapsed,
	onToggle,
	position,
	className,
}: PanelCollapseButtonProps) {
	const getIcon = () => {
		if (position === 'left') return isCollapsed ? ChevronRight : ChevronLeft;
		if (position === 'right') return isCollapsed ? ChevronLeft : ChevronRight;
		if (position === 'top') return isCollapsed ? ChevronDown : ChevronUp;
		return isCollapsed ? ChevronUp : ChevronDown;
	};

	const Icon = getIcon();

	return (
		<motion.button
			onClick={onToggle}
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			className={cn(
				'flex items-center justify-center',
				'w-6 h-6 rounded-md',
				'bg-muted/50 hover:bg-muted',
				'border border-border/50 hover:border-border',
				'text-muted-foreground hover:text-foreground',
				'transition-colors duration-200',
				'opacity-0 group-hover:opacity-100',
				'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50',
				className,
			)}
			aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
			title={isCollapsed ? 'Expand' : 'Collapse'}
		>
			<motion.div
				animate={{ rotate: isCollapsed ? 180 : 0 }}
				transition={{ type: 'spring', stiffness: 300, damping: 25 }}
			>
				<Icon className="w-4 h-4" />
			</motion.div>
		</motion.button>
	);
}
