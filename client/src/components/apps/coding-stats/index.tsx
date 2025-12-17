'use client';

import { useEffect, useState } from 'react';
import { api, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Code2,
	Trophy,
	Terminal,
	GitCommit,
	Star,
	Box,
	Activity,
	Zap,
	TrendingUp,
	Award,
	Calendar,
	Hash,
	Github,
	Code,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from '@/lib/animations';

function CodingStatsSkeleton() {
	return (
		<div className="p-8 space-y-12 animate-pulse max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="h-40 bg-card/20 rounded-3xl" />
				<div className="h-40 bg-card/20 rounded-3xl" />
				<div className="h-40 bg-card/20 rounded-3xl" />
				<div className="h-40 bg-card/20 rounded-3xl" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="h-96 bg-card/20 rounded-[2.5rem]" />
				<div className="h-96 bg-card/20 rounded-[2.5rem]" />
			</div>
		</div>
	);
}

// Simple Circular Progress Component
const CircularProgress = ({
	value,
	max,
	color,
	size = 120,
	strokeWidth = 10,
}: {
	value: number;
	max: number;
	color: string;
	size?: number;
	strokeWidth?: number;
}) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const progress = Math.min(value / max, 1);
	const dashoffset = circumference - progress * circumference;

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			{/* Background Circle */}
			<svg width={size} height={size} className="transform -rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-white/5"
				/>
				{/* Progress Circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					initial={{
						strokeDasharray: circumference,
						strokeDashoffset: circumference,
					}}
					animate={{ strokeDashoffset: dashoffset }}
					transition={{ duration: 1.5, ease: 'easeOut' }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-2xl font-black text-white">{value}</span>
				<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
					Solved
				</span>
			</div>
		</div>
	);
};

export function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getCodingStats();
			setStats(data);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('An unknown error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <CodingStatsSkeleton />;

	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	if (!stats) return null;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
				<ModuleHeader
					icon={Terminal}
					label="Analytics"
					title="Coding Performance"
					description="Real-time metrics from competitive programming platforms and open source contributions."
				/>

				{/* Quick Stats Grid */}
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
				>
					<div>
						<a
							href={stats.codechef.url}
							target="_blank"
							rel="noopener noreferrer"
							className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
						>
							@{stats.codechef.username} ↗
						</a>
					</div>
					<div className="space-y-6">
						<div>
							<h3 className="text-2xl font-bold text-white mb-1">CodeChef</h3>
							<div className="text-sm text-muted-foreground">
								Algorithmic Competitions
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-orange-500/20 transition-colors">
								<div className="text-3xl font-bold text-orange-500 mb-1">
									{stats.codechef.stats?.rating || 0}
								</div>
								<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
									Current Rating
								</div>
							</div>
							<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-orange-500/20 transition-colors">
								<div className="text-lg font-bold text-orange-500 mb-1 truncate leading-loose">
									{stats.codechef.stats?.globalRank || 'Unrated'}
								</div>
								<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
									Global Rank
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</ScrollArea>
	);
}
