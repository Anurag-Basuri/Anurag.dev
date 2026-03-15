'use client';

import { useEffect, useState, memo } from 'react';
import Image from 'next/image';
import { publicService } from '@/api';
import type { Certification } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { ShieldCheck, Award, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';

// ─── Skeleton ───────────────────────────────────────────────────

function CertificationsSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-6xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-32 bg-white/5 rounded-lg" />
				<div className="h-12 w-64 bg-white/5 rounded-xl" />
				<div className="h-5 w-80 bg-white/5 rounded-lg" />
			</div>
			<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
				{[1, 2, 3, 4].map(i => (
					<div
						key={i}
						className="h-80 bg-[#0a0a0a]/60 backdrop-blur border border-white/5 rounded-[2rem]"
					/>
				))}
			</div>
		</div>
	);
}

// ─── Certificate Thumbnail ─────────────────────────────────────

const CertThumbnail = memo(function CertThumbnail({
	url,
	title,
	issuer,
}: {
	url: string | null | undefined;
	title: string;
	issuer: string;
}) {
	const [imgFailed, setImgFailed] = useState(false);

	if (url && !imgFailed) {
		return (
			<div className="relative aspect-video overflow-hidden mx-3 mt-3 rounded-t-2xl sm:rounded-t-3xl border border-white/5">
				<div className="absolute inset-0 bg-[#050505] z-0" />
				<Image
					src={url}
					alt={`${title} certificate`}
					fill
					className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
					onError={() => setImgFailed(true)}
				/>
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
			</div>
		);
	}

	return (
		<div className="relative aspect-video overflow-hidden mx-3 mt-3 rounded-t-2xl sm:rounded-t-3xl border border-white/5">
			<div className="w-full h-full bg-gradient-to-br from-emerald-950/60 via-[#0a0a0a] to-[#050505] flex flex-col items-center justify-center gap-3">
				<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
				<Award className="w-10 h-10 text-emerald-500/30 group-hover:text-emerald-400/50 transition-colors duration-500" />
				<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/40 group-hover:text-emerald-400/60 transition-colors">
					{issuer}
				</span>
			</div>
		</div>
	);
});

// ─── Certification Card ─────────────────────────────────────────

const CertCard = memo(function CertCard({ cert }: { cert: Certification }) {
	return (
		<motion.div
			variants={staggerItem}
			whileHover={{ y: -8, scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300, damping: 20 }}
			className="group relative flex flex-col h-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-emerald-500/30 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_0px_rgba(16,185,129,0.15)]"
		>
			{/* Ambient Glow */}
			<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

			{/* Thumbnail */}
			<CertThumbnail url={cert.certificateUrl} title={cert.title} issuer={cert.issuer} />

			<div className="p-5 sm:p-6 relative z-10 flex flex-col flex-1">
				{/* Issuer Badge */}
				<div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-inner w-fit mb-4">
					<span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400">
						{cert.issuer}
					</span>
				</div>

				<h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors mb-3">
					{cert.title}
				</h3>

				<div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold font-mono text-muted-foreground mb-4 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
					<Activity className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
					<span>
						Issued:{' '}
						{new Date(cert.startDate ?? cert.createdAt).getFullYear()}
					</span>
				</div>

				{(cert.skills ?? []).length > 0 && (
					<div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 flex-grow content-start">
						{(cert.skills ?? []).map(skill => (
							<span
								key={skill}
								className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg bg-black/50 text-muted-foreground/80 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner"
							>
								{skill}
							</span>
						))}
					</div>
				)}

				{cert.credentialUrl && (
					<div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
						<a
							href={cert.credentialUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors group/link"
							aria-label={`Verify credential for ${cert.title}`}
						>
							Verify Credential
							<ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
						</a>
					</div>
				)}
			</div>
		</motion.div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function CertificationModule() {
	const [certs, setCerts] = useState<Certification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCerts() {
			const { data } = await publicService.getCertifications();
			setCerts(data || []);
			setLoading(false);
		}
		fetchCerts();
	}, []);

	if (loading) return <CertificationsSkeleton />;

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					label="Credentials"
					icon={ShieldCheck}
					title="Verified Attributes"
					description="Professional certifications and credentials verifying core competencies."
				/>

				{certs.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50">
						No verified credentials found.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
					>
						{certs.map(cert => (
							<CertCard key={cert.id} cert={cert} />
						))}
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}
