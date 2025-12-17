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
			className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8"
		>
			<div className="relative z-10">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.1 }}
					className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-3"
				>
					<span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
						<Icon className="w-4 h-4" />
					</span>
					<span>{label}</span>
				</motion.div>
				<h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-white/90 to-white/50 leading-tight mb-2 tracking-tight">
					{title}
				</h1>
				{description && (
					<p className="text-sm text-muted-foreground/80 mt-2 max-w-lg leading-relaxed font-medium">
						{description}
					</p>
				)}
			</div>

			{actions && (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2 }}
					className="shrink-0 relative z-10"
				>
					{actions}
				</motion.div>
			)}

			{/* Decorative Elements */}
			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-emerald-500/50 via-transparent to-transparent opacity-50" />
			<div className="absolute -bottom-px left-0 w-24 h-0.5 bg-emerald-500 blur-[1px]" />
		</motion.div>
	);
}
