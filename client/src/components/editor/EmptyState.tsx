'use client';

import { useRouter } from 'next/navigation';
import { FolderOpen, FileText, Briefcase, Mail, User, Sparkles } from 'lucide-react';
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
		<div className="h-full w-full flex items-center justify-center bg-transparent overflow-hidden relative">
			{/* Animated Background Blobs */}
			<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 50, 0],
						y: [0, 30, 0],
						rotate: [0, 90, 0],
					}}
					transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
					className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full"
				/>
				<motion.div
					animate={{
						scale: [1, 1.3, 1],
						x: [0, -40, 0],
						y: [0, 60, 0],
						rotate: [0, -120, 0],
					}}
					transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
					className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"
				/>
				<motion.div
					animate={{
						scale: [1, 1.1, 1],
						x: [0, 30, 0],
						y: [0, -50, 0],
					}}
					transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
					className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full"
				/>
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, ease: 'easeOut' }}
				className="max-w-4xl mx-auto text-center space-y-12 p-8 relative z-10"
			>
				{/* Floating Icon */}
				<div className="relative inline-block mt-4 mb-2">
					<motion.div
						animate={{
							y: [0, -10, 0],
							rotate: [0, 5, 0],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						className="relative z-10"
					>
						<div className="w-24 h-24 mx-auto rounded-3xl bg-linear-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl relative group overflow-hidden">
							<div className="absolute inset-0 bg-linear-to-tr from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<FolderOpen
								className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
								strokeWidth={1.5}
							/>
						</div>
					</motion.div>

					{/* Particle sparks */}
					{[...Array(3)].map((_, i) => (
						<motion.div
							key={i}
							animate={{
								y: [0, -40, -60],
								x: [0, (i - 1) * 30, (i - 1) * 45],
								opacity: [0, 1, 0],
								scale: [0, 1, 0.5],
							}}
							transition={{
								duration: 2.5,
								repeat: Infinity,
								delay: i * 0.8,
								ease: 'easeOut',
							}}
							className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
						/>
					))}
				</div>

				{/* Glassmorphic Welcome Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.6 }}
					className="space-y-6 px-10 py-10 rounded-[2.5rem] backdrop-blur-md bg-white/2 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative group"
				>
					<div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-b from-white/5 to-transparent pointer-events-none" />

					<div className="space-y-3">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-emerald-400/80 uppercase"
						>
							<Sparkles className="w-3 h-3" />
							<span>System Initialized</span>
							<Sparkles className="w-3 h-3" />
						</motion.div>
						<h2 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
							Interactive <span className="text-emerald-400">Portfolio</span>
						</h2>
					</div>

					<p className="text-white/60 text-lg max-w-lg mx-auto leading-relaxed font-light">
						An industry-grade workspace exploring the intersection of{' '}
						<span className="text-blue-300 font-medium">Development</span>,{' '}
						<span className="text-purple-300 font-medium">AI</span>, and{' '}
						<span className="text-emerald-300 font-medium">Design</span>.
					</p>
				</motion.div>

				{/* Quick Actions */}
				<div className="space-y-6">
					<div className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase flex items-center justify-center gap-4">
						<div className="h-px w-8 bg-white/5" />
						Quick Access
						<div className="h-px w-8 bg-white/5" />
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{quickActions.map((action, index) => {
							const Icon = action.icon;
							return (
								<motion.button
									key={action.moduleId}
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
									onClick={() => handleNavigate(action.moduleId)}
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
									className="group p-5 rounded-2xl bg-black/40 hover:bg-white/5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-2xl relative overflow-hidden"
								>
									{/* Hover gradient */}
									<div className="absolute inset-0 bg-linear-to-br from-emerald-500/0 via-transparent to-transparent group-hover:from-emerald-500/5 transition-colors duration-500" />

									<div className="flex flex-col items-center gap-3 relative z-10">
										<div className="w-12 h-12 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
											<Icon className="w-6 h-6 text-white/50 group-hover:text-emerald-400 transition-colors" />
										</div>
										<div className="space-y-1">
											<div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors tracking-wide">
												{action.label}
											</div>
											<div className="text-[10px] text-white/30 group-hover:text-white/40 italic">
												{action.description.split(' ').slice(-2).join(' ')}
											</div>
										</div>
									</div>
								</motion.button>
							);
						})}
					</div>
				</div>

				{/* Keyboard Hints */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.2, duration: 0.5 }}
					className="pt-4 flex items-center justify-center gap-10"
				>
					<div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300 cursor-default">
						<div className="flex gap-1">
							<kbd className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/10 text-[10px] font-mono">
								Ctrl
							</kbd>
							<kbd className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/10 text-[10px] font-mono">
								B
							</kbd>
						</div>
						<span className="text-[10px] font-bold uppercase tracking-widest">
							Sidebar
						</span>
					</div>
					<div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300 cursor-default">
						<div className="flex gap-1">
							<kbd className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/10 text-[10px] font-mono">
								Ctrl
							</kbd>
							<kbd className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/10 text-[10px] font-mono">
								`
							</kbd>
						</div>
						<span className="text-[10px] font-bold uppercase tracking-widest">
							Terminal
						</span>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
}
