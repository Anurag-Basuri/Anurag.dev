'use client';

import { useEffect, useState } from 'react';
import { api, AboutData } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, Terminal, User, MapPin, Calendar, Sparkles, Cpu, Layers, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModuleError } from '@/components/ui/module-error';
import { cn } from '@/lib/utils';

// Skeleton loader component
function AboutSkeleton() {
	return (
		<div className="p-6 space-y-8 animate-pulse">
			<div className="flex justify-between items-end border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
				<div className="h-4 bg-muted rounded w-24" />
			</div>
			<div className="flex flex-col md:flex-row gap-6">
				<div className="md:w-1/3 space-y-4">
					<div className="aspect-square bg-muted rounded-2xl" />
					<div className="h-24 bg-muted rounded-xl" />
				</div>
				<div className="md:w-2/3 space-y-6">
					<div className="h-32 bg-muted rounded-xl" />
					<div className="grid grid-cols-2 gap-4">
						<div className="h-40 bg-muted rounded-xl" />
						<div className="h-40 bg-muted rounded-xl" />
					</div>
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

	if (loading) return <AboutSkeleton />;

	if (error) {
		return (
			<ModuleError
				message={error}
				onRetry={() => {
					setLoading(true);
					setError(null);
					api.getAbout()
						.then(setAbout)
						.catch(err => setError(err.message))
						.finally(() => setLoading(false));
				}}
			/>
		);
	}

	if (!about) return null;

	const fadeInUp = {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.4 },
	};

	return (
		<ScrollArea className="h-full">
			<div className="p-6 space-y-8 max-w-6xl mx-auto">
				{/* 1. Standardized System Header */}
				<div className="flex items-end justify-between border-b border-border/40 pb-4">
					<div>
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
							PROFILE DOSSIER
						</h1>
						<p className="text-sm text-muted-foreground tracking-wider uppercase font-mono mt-1">
							User Identification & Capability Analysis
						</p>
					</div>
					<div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
						<User className="w-3 h-3" />
						<span>ID: VERIFIED</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
					{/* Left Column: Identity Card */}
					<div className="md:col-span-4 space-y-6">
						<motion.div
							initial={fadeInUp.initial}
							animate={fadeInUp.animate}
							className="bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group"
						>
							<div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

							<div className="relative w-40 h-40 mb-6">
								<div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_10s_linear_infinite]" />
								<div className="absolute inset-2 rounded-full border border-primary/20" />
								<img
									src="/profile.png"
									alt="Profile"
									className="w-full h-full object-cover rounded-full p-1.5"
								/>
								<div className="absolute bottom-2 right-2 p-2 bg-background/80 backdrop-blur rounded-full border border-border shadow-sm">
									<Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
								</div>
							</div>

							<h2 className="text-2xl font-bold text-foreground mb-1">
								{about.name}
							</h2>
							<p className="text-sm text-primary font-mono mb-4 px-3 py-1 bg-primary/10 rounded-full">
								{about.tagline}
							</p>

							<div className="w-full grid grid-cols-2 gap-2 mt-2">
								<div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex flex-col items-center">
									<MapPin className="w-4 h-4 text-muted-foreground mb-1" />
									<span className="text-xs font-medium">Remote</span>
								</div>
								<div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex flex-col items-center">
									<Calendar className="w-4 h-4 text-muted-foreground mb-1" />
									<span className="text-xs font-medium">EST Zone</span>
								</div>
							</div>
						</motion.div>

						{/* "About" Quick Summary */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="p-5 rounded-2xl bg-muted/20 border border-border/40 text-sm leading-relaxed text-muted-foreground"
						>
							<p>
								<span className="text-primary font-bold mr-2">&gt;</span>
								{about.short}
							</p>
						</motion.div>
					</div>

					{/* Right Column: Skills & Details */}
					<div className="md:col-span-8 space-y-6">
						{/* Skills Bento Grid */}
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							className="bg-card/20 border border-border/40 rounded-2xl p-6"
						>
							<div className="flex items-center gap-2 mb-6">
								<Code2 className="w-5 h-5 text-primary" />
								<h3 className="font-bold tracking-widest text-sm uppercase">
									Technical Capabilities
								</h3>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Frontend */}
								<div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors group">
									<div className="flex items-center gap-2 mb-3 text-indigo-400">
										<Layers className="w-4 h-4" />
										<span className="font-bold text-xs uppercase">
											Frontend Architecture
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5">
										{about.skills.frontend.map(skill => (
											<span
												key={skill}
												className="px-2 py-1 text-[11px] font-medium bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20"
											>
												{skill}
											</span>
										))}
									</div>
								</div>

								{/* Backend */}
								<div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
									<div className="flex items-center gap-2 mb-3 text-emerald-400">
										<Cpu className="w-4 h-4" />
										<span className="font-bold text-xs uppercase">
											Backend Systems
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5">
										{about.skills.backend.map(skill => (
											<span
												key={skill}
												className="px-2 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20"
											>
												{skill}
											</span>
										))}
									</div>
								</div>

								{/* ML/AI (Full Width) */}
								<div className="sm:col-span-2 p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors group">
									<div className="flex items-center gap-2 mb-3 text-purple-400">
										<Box className="w-4 h-4" />
										<span className="font-bold text-xs uppercase">
											Artificial Intelligence & ML
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5">
										{about.skills.ml.map(skill => (
											<span
												key={skill}
												className="px-2 py-1 text-[11px] font-medium bg-purple-500/10 text-purple-300 rounded border border-purple-500/20"
											>
												{skill}
											</span>
										))}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Terminal Footer Quote - "Who I Am" */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-muted-foreground flex items-center gap-4"
						>
							<Terminal className="w-4 h-4 text-primary" />
							<div className="flex-1 typing-cursor">
								<span className="text-green-500 mr-2">➜</span>
								<span>echo "Checking capability matrix... STATUS: OPTIMIZED"</span>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
