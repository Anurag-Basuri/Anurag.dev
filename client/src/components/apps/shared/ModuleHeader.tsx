import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/lib/animations';

interface ModuleHeaderProps {
	icon: LucideIcon;
	label: string;
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

export function ModuleHeader({
	icon: Icon,
	label,
	title,
	description,
	actions,
}: ModuleHeaderProps) {
	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			animate="visible"
			className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/40 pb-6"
		>
			<div>
				<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
					<Icon className="w-4 h-4" />
					<span>{label}</span>
				</div>
				<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-blue-500 leading-tight">
					{title}
				</h1>
				{description && (
					<p className="text-sm text-muted-foreground mt-2 max-w-lg">{description}</p>
				)}
			</div>
			{actions && <div className="shrink-0">{actions}</div>}
		</motion.div>
	);
}
