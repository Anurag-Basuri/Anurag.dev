'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { GraduationCap, MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeInUp } from '@/animations/motion';

// --- 3D Card Component ---
const TiltCard = ({ entry }: { entry: JourneyEntry }) => {
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
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const xPct = mouseX / width - 0.5;
		const yPct = mouseY / height - 0.5;
		x.set(xPct);
		y.set(yPct);
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
					'relative flex flex-col justify-between h-full min-h-[300px] p-8 rounded-3xl backdrop-blur-xl border shadow-2xl transition-all duration-300',
					entry.highlighted
						? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
						: 'bg-[#0a0a0a]/80 border-white/10 hover:border-white/20 hover:bg-[#111]',
				)}
				style={{ transform: 'translateZ(50px)' }}
			>
				{/* Ambient Glow behind card on hover */}
				<div
					className={cn(
						'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl -z-10',
						entry.highlighted ? 'bg-blue-500/20' : 'bg-white/5',
					)}
				/>

				{/* Card Header */}
				<div className="space-y-4" style={{ transform: 'translateZ(30px)' }}>
					<div className="flex justify-between items-start gap-4">
						<div className="space-y-1">
							<h3 className="text-2xl font-black text-white tracking-tight leading-tight">
								{entry.title}
							</h3>
							{entry.degree && entry.fieldOfStudy && (
								<p className="text-lg font-medium text-blue-400">
									{entry.degree} in {entry.fieldOfStudy}
								</p>
							)}
						</div>

						{entry.grade && (
							<div className="flex shrink-0 items-center justify-center px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
								{entry.grade}
							</div>
						)}
					</div>

					{/* Meta Info */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						{entry.organization && (
							<span className="flex items-center gap-1.5 text-white/90">
								<BookOpen className="w-4 h-4" />
								{entry.organization}
							</span>
						)}
						<span className="flex items-center gap-1.5">
							<Calendar className="w-4 h-4" />
							{entry.date}
						</span>
						{entry.location && (
							<span className="flex items-center gap-1.5">
								<MapPin className="w-4 h-4" />
								{entry.location}
							</span>
						)}
						{entry.board && (
							<span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
								<Award className="w-3.5 h-3.5" />
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
					<p className="text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-wrap">
						{entry.description}
					</p>

					{entry.skills && entry.skills.length > 0 && (
						<div className="flex flex-wrap gap-2 pt-2">
							{(entry.skills ?? []).map(skill => (
								<span
									key={skill}
									className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-black/40 text-muted-foreground border border-white/5 group-hover:border-white/10 transition-colors"
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
};

// --- Main Module ---
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

	// Filter and sort only education experience
	const educationEntries = useMemo(() => {
		return entries
			.filter(entry => entry.type === 'education')
			.sort((a, b) => {
				const dateA = new Date(a.startDate || 0).getTime();
				const dateB = new Date(b.startDate || 0).getTime();
				return dateB - dateA; // Newest first
			});
	}, [entries]);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
			</div>
		);
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-6 md:p-12 max-w-6xl mx-auto pb-32">
				<SectionHeader
					icon={GraduationCap}
					label="Academics"
					title="Educational Background"
					description="Degrees, academic progression, and key coursework."
				/>

				{educationEntries.length === 0 ? (
					<div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-2xl bg-muted/5">
						No educational history found.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
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
