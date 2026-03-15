'use client';

import { useEffect, useState, useMemo, useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { GraduationCap, MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeInUp } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function EducationSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-6xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-28 bg-white/5 rounded-lg" />
				<div className="h-12 w-80 bg-white/5 rounded-xl" />
				<div className="h-5 w-72 bg-white/5 rounded-lg" />
			</div>
			<div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{[1, 2, 3, 4].map(i => (
					<div
						key={i}
						className="h-72 bg-[#0a0a0a]/60 backdrop-blur border border-white/5 rounded-3xl"
					/>
				))}
			</div>
		</div>
	);
}

// ─── 3D Tilt Card ───────────────────────────────────────────────

const TiltCard = memo(function TiltCard({ entry }: { entry: JourneyEntry }) {
	const ref = useRef<HTMLDivElement>(null);

	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseXSpring = useSpring(x);
	const mouseYSpring = useSpring(y);

	const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
	const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		x.set(mouseX / rect.width - 0.5);
		y.set(mouseY / rect.height - 0.5);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				rotateY,
				rotateX,
				transformStyle: 'preserve-3d',
			}}
			variants={fadeInUp}
			className="relative group w-full perspective-1000"
		>
			<div
				className={cn(
					'relative flex flex-col justify-between h-full min-h-[280px] sm:min-h-[300px] p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border shadow-2xl transition-all duration-300',
					entry.highlighted
						? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
						: 'bg-[#0a0a0a]/80 border-white/10 hover:border-white/20 hover:bg-[#111]',
				)}
				style={{ transform: 'translateZ(50px)' }}
			>
				{/* Ambient Glow */}
				<div
					className={cn(
						'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl blur-xl -z-10',
						entry.highlighted ? 'bg-blue-500/20' : 'bg-white/5',
					)}
				/>

				{/* Card Header */}
				<div className="space-y-4" style={{ transform: 'translateZ(30px)' }}>
					<div className="flex justify-between items-start gap-4">
						<div className="space-y-1">
							<h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
								{entry.title}
							</h3>
							{entry.degree && entry.fieldOfStudy && (
								<p className="text-base sm:text-lg font-medium text-blue-400">
									{entry.degree} in {entry.fieldOfStudy}
								</p>
							)}
						</div>

						{entry.grade && (
							<div className="flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs sm:text-sm shadow-inner group-hover:scale-110 transition-transform">
								{entry.grade}
							</div>
						)}
					</div>

					{/* Meta Info */}
					<div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						{entry.organization && (
							<span className="flex items-center gap-1.5 text-white/90">
								<BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
								{entry.organization}
							</span>
						)}
						<span className="flex items-center gap-1.5">
							<Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
							{entry.date}
						</span>
						{entry.location && (
							<span className="flex items-center gap-1.5">
								<MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
								{entry.location}
							</span>
						)}
						{entry.board && (
							<span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
								<Award className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
								{entry.board}
							</span>
						)}
					</div>
				</div>

				{/* Description & Skills */}
				<div
					className="pt-6 mt-6 border-t border-white/10 space-y-4"
					style={{ transform: 'translateZ(40px)' }}
				>
					<p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-wrap">
						{entry.description}
					</p>

					{(entry.skills ?? []).length > 0 && (
						<div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
							{(entry.skills ?? []).map(skill => (
								<span
									key={skill}
									className="px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg bg-black/40 text-muted-foreground border border-white/5 group-hover:border-white/10 transition-colors"
								>
									{skill}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function EducationModule() {
	const [entries, setEntries] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchJourney() {
			const { data } = await publicService.getJourney();
			setEntries(data || []);
			setLoading(false);
		}
		fetchJourney();
	}, []);

	const educationEntries = useMemo(() => {
		return entries
			.filter(entry => entry.type === 'education')
			.sort((a, b) => {
				const dateA = new Date(a.startDate || 0).getTime();
				const dateB = new Date(b.startDate || 0).getTime();
				return dateB - dateA;
			});
	}, [entries]);

	if (loading) return <EducationSkeleton />;

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					icon={GraduationCap}
					label="Academics"
					title="Educational Background"
					description="Degrees, academic progression, and key coursework."
				/>

				{educationEntries.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50">
						No educational history found.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
					>
						{educationEntries.map(entry => (
							<TiltCard key={entry.id} entry={entry} />
						))}
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}
