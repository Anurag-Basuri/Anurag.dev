'use client';

import { useRouter } from 'next/navigation';
import { FolderOpen, FileText, Briefcase, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState() {
	const router = useRouter();

	const quickActions = [
		{
			label: 'About Me',
			moduleId: 'about',
			icon: User,
			description: 'Learn about my background',
		},
		{
			label: 'Projects',
			moduleId: 'projects',
			icon: Briefcase,
			description: 'View my work',
		},
		{
			label: 'Journey',
			moduleId: 'journey',
			icon: FileText,
			description: 'See my journey',
		},
		{
			label: 'Contact',
			moduleId: 'contact',
			icon: Mail,
			description: 'Get in touch',
		},
	];

	const handleNavigate = (moduleId: string) => {
		router.push(`/portfolio/${moduleId}`);
	};

	return (
		<div className="h-full w-full flex items-center justify-center bg-linear-to-br from-black/5 via-transparent to-emerald-500/5">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-3xl mx-auto text-center space-y-8 p-8"
			>
				{/* Icon */}
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="relative inline-block"
				>
					<div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
					<div className="relative w-24 h-24 mx-auto rounded-2xl bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.15)]">
						<FolderOpen className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
					</div>
				</motion.div>

				{/* Welcome Message */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.5 }}
					className="space-y-4"
				>
					<h2 className="text-4xl font-bold bg-linear-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">
						Welcome to My Portfolio
					</h2>
					<p className="text-white/60 text-lg max-w-md mx-auto">
						Open a file from the sidebar or choose a quick action below to explore my
						work
					</p>
				</motion.div>

				{/* Quick Actions Grid */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.5 }}
					className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4"
				>
					{quickActions.map((action, index) => {
						const Icon = action.icon;
						return (
							<motion.button
								key={action.moduleId}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
								onClick={() => handleNavigate(action.moduleId)}
								className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
							>
								<div className="flex flex-col items-center gap-2">
									<div className="w-10 h-10 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/20 group-hover:border-emerald-500/40 flex items-center justify-center transition-all duration-200">
										<Icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
									</div>
									<div className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
										{action.label}
									</div>
								</div>
							</motion.button>
						);
					})}
				</motion.div>

				{/* Keyboard Hint */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1, duration: 0.5 }}
					className="pt-8 text-xs text-white/40"
				>
					<p>
						<kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">
							Ctrl
						</kbd>{' '}
						+{' '}
						<kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">
							B
						</kbd>{' '}
						to toggle sidebar
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
