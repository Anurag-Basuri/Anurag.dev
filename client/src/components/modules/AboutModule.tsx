'use client';

import { useEffect, useState } from 'react';
import { api, AboutData } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

// Skeleton loader component
function AboutSkeleton() {
	return (
		<div className="p-6 space-y-6 animate-pulse">
			<div className="flex flex-col md:flex-row gap-6 items-start">
				<div className="w-32 h-32 rounded-full bg-muted" />
				<div className="flex-1 space-y-3">
					<div className="h-8 bg-muted rounded w-48" />
					<div className="h-6 bg-muted rounded w-64" />
					<div className="h-20 bg-muted rounded" />
				</div>
			</div>
			<div className="space-y-4">
				<div className="h-6 bg-muted rounded w-40" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map(i => (
						<div key={i} className="h-40 bg-muted rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
}

export function AboutModule() {
	const [about, setAbout] = useState<AboutData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		api.getAbout()
			.then(setAbout)
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <AboutSkeleton />;
	}

	if (error) {
		return (
			<div className="p-6 flex items-center justify-center h-full">
				<div className="text-center space-y-2">
					<div className="text-destructive text-lg font-mono">ERROR</div>
					<div className="text-muted-foreground">{error}</div>
				</div>
			</div>
		);
	}

	if (!about) return null;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 space-y-6">
				{/* Header with Profile */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: 'easeOut' }}
					className="flex flex-col md:flex-row gap-6 items-start"
				>
					{/* Profile Photo with Premium Styling */}
					<motion.div
						whileHover={{ scale: 1.05, rotate: 2 }}
						transition={{ duration: 0.3 }}
						className="shrink-0"
					>
						<div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/40 dark:border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)] ring-4 ring-primary/10 dark:ring-primary/20">
							<img
								src="/profile.png"
								alt="Profile"
								className="w-full h-full object-cover"
							/>
						</div>
					</motion.div>

					{/* Name and Tagline */}
					<div className="flex-1">
						<motion.h1
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1, duration: 0.4 }}
							className="text-3xl font-bold text-foreground mb-2 font-mono"
						>
							{about.name}
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2, duration: 0.4 }}
							className="text-xl text-primary mb-3 flex items-center gap-2"
						>
							<Code2 className="w-5 h-5" />
							{about.tagline}
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.4 }}
							className="border-l-4 border-primary pl-4 glass-premium rounded-r p-3"
						>
							<p className="text-foreground/90 leading-relaxed">{about.short}</p>
						</motion.div>
					</div>
				</motion.div>

				{/* Skills Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="space-y-4"
				>
					<h2 className="text-2xl font-bold text-primary flex items-center gap-2 font-mono">
						<Terminal className="w-6 h-6" />
						<span className="text-muted-foreground">$</span> cat skills.json
					</h2>

					<div className="grid gap-4 md:grid-cols-3">
						{/* Frontend Skills */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							whileHover={{ scale: 1.02, y: -4 }}
							transition={{ delay: 0.2, duration: 0.3 }}
							className="glass-premium bg-linear-to-br from-emerald-500/15 via-emerald-500/8 to-emerald-500/5 dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/25 rounded-xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.24)] hover:shadow-[0_12px_40px_rgb(16,185,129,0.25)] dark:hover:shadow-[0_12px_40px_rgb(16,185,129,0.35)] glow-primary-hover"
						>
							<h3 className="text-emerald-600 dark:text-emerald-400 font-semibold mb-3 text-lg flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
								Frontend
							</h3>
							<div className="flex flex-wrap gap-2">
								{about.skills.frontend.map(skill => (
									<span
										key={skill}
										className="px-3 py-1.5 bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/40 dark:border-emerald-500/30 rounded-full text-sm text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-500/30 dark:hover:bg-emerald-500/20 transition-colors"
									>
										{skill}
									</span>
								))}
							</div>
						</motion.div>

						{/* Backend Skills */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							whileHover={{ scale: 1.02, y: -4 }}
							transition={{ delay: 0.3, duration: 0.3 }}
							className="glass-premium bg-linear-to-br from-blue-500/15 via-blue-500/8 to-blue-500/5 dark:from-blue-500/20 dark:via-blue-500/10 dark:to-blue-500/5 border-blue-500/30 dark:border-blue-500/25 rounded-xl p-5 hover:border-blue-500/50 dark:hover:border-blue-500/40 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.24)] hover:shadow-[0_12px_40px_rgb(59,130,246,0.25)] dark:hover:shadow-[0_12px_40px_rgb(59,130,246,0.35)] glow-primary-hover"
						>
							<h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-3 text-lg flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
								Backend
							</h3>
							<div className="flex flex-wrap gap-2">
								{about.skills.backend.map(skill => (
									<span
										key={skill}
										className="px-3 py-1.5 bg-blue-500/20 dark:bg-blue-500/10 border border-blue-500/40 dark:border-blue-500/30 rounded-full text-sm text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-500/30 dark:hover:bg-blue-500/20 transition-colors"
									>
										{skill}
									</span>
								))}
							</div>
						</motion.div>

						{/* ML/AI Skills */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							whileHover={{ scale: 1.02, y: -4 }}
							transition={{ delay: 0.4, duration: 0.3 }}
							className="glass-premium bg-linear-to-br from-purple-500/15 via-purple-500/8 to-purple-500/5 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-purple-500/5 border-purple-500/30 dark:border-purple-500/25 rounded-xl p-5 hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.24)] hover:shadow-[0_12px_40px_rgb(168,85,247,0.25)] dark:hover:shadow-[0_12px_40px_rgb(168,85,247,0.35)] glow-primary-hover"
						>
							<h3 className="text-purple-600 dark:text-purple-400 font-semibold mb-3 text-lg flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
								ML/AI
							</h3>
							<div className="flex flex-wrap gap-2">
								{about.skills.ml.map(skill => (
									<span
										key={skill}
										className="px-3 py-1.5 bg-purple-500/20 dark:bg-purple-500/10 border border-purple-500/40 dark:border-purple-500/30 rounded-full text-sm text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-500/30 dark:hover:bg-purple-500/20 transition-colors"
									>
										{skill}
									</span>
								))}
							</div>
						</motion.div>
					</div>
				</motion.div>

				{/* Footer */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="pt-4 border-t border-border bg-muted/50 backdrop-blur-sm rounded p-3"
				>
					<p className="text-sm text-muted-foreground font-mono">
						💡 Type{' '}
						<span className="text-emerald-600 dark:text-emerald-400 font-bold">
							contact
						</span>{' '}
						to get in touch or{' '}
						<span className="text-blue-600 dark:text-blue-400 font-bold">projects</span>{' '}
						to see my work.
					</p>
				</motion.div>
			</div>
		</ScrollArea>
	);
}
