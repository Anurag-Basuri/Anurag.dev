'use client';

import { useEffect, useState } from 'react';
import { api, JourneyEntry } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

const categoryColors: Record<string, string> = {
	education: 'text-blue-400 border-blue-400',
	work: 'text-green-400 border-green-400',
	project: 'text-purple-400 border-purple-400',
	achievement: 'text-yellow-400 border-yellow-400',
};

import { useRef } from 'react';
import { Briefcase, GraduationCap, Award, Star, Calendar } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

const categoryConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; bg: string }> = {
	education: {
		color: 'text-blue-400',
		icon: GraduationCap,
		bg: 'bg-blue-500/10 border-blue-500/20',
	},
	work: {
		color: 'text-emerald-400',
		icon: Briefcase,
		bg: 'bg-emerald-500/10 border-emerald-500/20',
	},
	project: { color: 'text-purple-400', icon: Star, bg: 'bg-purple-500/10 border-purple-500/20' },
	achievement: {
		color: 'text-yellow-400',
		icon: Award,
		bg: 'bg-yellow-500/10 border-yellow-500/20',
	},
};

export function JourneyModule() {
	const [journey, setJourney] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const containerRef = useRef(null);

	useEffect(() => {
		api.getJourney()
			.then(data => setJourney(data.items.sort((a, b) => b.year - a.year))) // Sort descending
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div className="p-10 text-center text-muted-foreground animate-pulse">
				Loading timeline data...
			</div>
		);
	if (error)
		return <div className="p-10 text-center text-red-400">Error loading timeline: {error}</div>;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-4xl mx-auto pb-20" ref={containerRef}>
				<div className="mb-10">
					<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-emerald-600 mb-2 flex items-center gap-2">
						<span className="text-emerald-500">$</span> cat journey/timeline.md
					</h1>
					<p className="text-muted-foreground text-sm">
						Professional milestones and academic history
					</p>
				</div>

				<div className="relative space-y-8 pl-8 md:pl-0">
					{/* Central Line for Desktop */}
					<div className="absolute left-[3px] md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/50 via-primary/20 to-transparent md:-translate-x-1/2 rounded-full" />

					{journey.map((entry, index) => {
						const config = categoryConfig[entry.category] || categoryConfig.work;
						const Icon = config.icon;
						const isLeft = index % 2 === 0;

						return (
							<motion.div
								key={entry.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-100px' }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className={`relative flex flex-col md:flex-row gap-8 ${
									isLeft ? 'md:flex-row-reverse' : ''
								}`}
							>
								{/* Content Card */}
								<div className="flex-1">
									<div
										className={`
                                        p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]
                                        ${config.bg} hover:border-opacity-50
                                    `}
									>
										<div className="flex items-center justify-between mb-3">
											<div
												className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${config.bg} bg-background/50`}
											>
												<Icon className={`w-3 h-3 ${config.color}`} />
												<span className={config.color}>
													{entry.category}
												</span>
											</div>
											<div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
												<Calendar className="w-3.5 h-3.5" />
												<span>{entry.year}</span>
											</div>
										</div>

										<h3 className="text-lg font-bold text-foreground mb-1.5">
											{entry.title}
										</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{entry.description}
										</p>
									</div>
								</div>

								{/* Timeline Node */}
								<div className="absolute left-[-29px] md:left-1/2 md:-translate-x-1/2 top-6 flex items-center justify-center">
									<div
										className={`w-4 h-4 rounded-full border-2 border-background ${config.bg.replace(
											'/10',
											'',
										)} shadow-[0_0_10px_currentColor] z-10`}
										style={{ color: 'var(--primary)' }}
									/>
									<div
										className={`absolute w-3 h-3 rounded-full ${config.color.replace(
											'text-',
											'bg-',
										)}`}
									/>
								</div>

								{/* Spacer for alternate side */}
								<div className="flex-1 hidden md:block" />
							</motion.div>
						);
					})}
				</div>

				{journey.length === 0 && (
					<div className="text-center py-20 text-muted-foreground">
						<p>Timeline data is currently empty.</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
