'use client';

import { useEffect, useState, memo } from 'react';
import { publicService } from '@/api';
import type { Certification } from '@/api/schema';

import { ShieldCheck, Award, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { cn } from '@/lib/utils';

// ─── Skeleton ───────────────────────────────────────────────────

function CertificationsSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-6xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-32 bg-foreground/5 rounded-lg" />
				<div className="h-12 w-64 bg-foreground/5 rounded-xl" />
				<div className="h-5 w-80 bg-foreground/5 rounded-lg" />
			</div>
			<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 auto-rows-fr">
				{[1, 2, 3, 4].map(i => (
					<div
						key={i}
						className="h-80 bg-foreground/5 rounded-[2.5rem]"
					/>
				))}
			</div>
		</div>
	);
}

// ─── Certification Card ─────────────────────────────────────────

const CertCard = memo(function CertCard({ cert }: { cert: Certification }) {
	return (
		<motion.div
			variants={staggerItem}
			whileHover={cardHover}
			className="group relative flex flex-col h-full bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-border rounded-3xl overflow-hidden transition-all duration-500 hover:border-cyan-500/40 shadow-2xl"
		>
			{/* Ambient Glow */}
			<div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/10 transition-colors duration-500 pointer-events-none" />

			{/* Thumbnail */}
			<div className="relative aspect-16/10 overflow-hidden mx-3 mt-3 rounded-t-3xl border border-border bg-card">
				<UrlThumbnail
					url={cert.certificateUrl || cert.credentialUrl}
					title={`${cert.title} certificate`}
					fallbackIcon={Award}
					fallbackLabel={cert.issuer}
					fallbackGradient="from-cyan-950/60"
				/>
				{/* Inner shadow */}
				<div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
			</div>

			<div className="p-6 relative z-10 flex flex-col grow -mt-6">
				{/* Issuer Badge overhanging image */}
				<div className="flex justify-between items-start mb-6">
					<div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-2xl shadow-xl w-fit group-hover:scale-105 group-hover:border-cyan-500/30 transition-all duration-500">
						<ShieldCheck className="w-4 h-4 text-cyan-400" />
						<span className="text-[10px] font-black uppercase tracking-widest text-foreground/90">
							{cert.issuer}
						</span>
					</div>
				</div>

				<h3 className="text-xl font-black text-foreground tracking-tight leading-tight group-hover:text-cyan-400 transition-colors mb-3">
					{cert.title}
				</h3>

				<div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400/80 mb-5">
					<Activity className="w-3.5 h-3.5" />
					<span>
						Issued:{' '}
						{new Date(cert.startDate ?? cert.createdAt).getFullYear()}
					</span>
				</div>

				{(cert.skills ?? []).length > 0 && (
					<div className="flex flex-wrap gap-2 mb-6 grow content-start">
						{(cert.skills ?? []).map(skill => (
							<span
								key={skill}
								className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-foreground/5 text-muted-foreground border border-border group-hover:border-cyan-500/30 group-hover:text-foreground/90 transition-colors shadow-inner"
							>
								{skill}
							</span>
						))}
					</div>
				)}

				{cert.credentialUrl && (
					<div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
						<a
							href={cert.credentialUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-cyan-400 transition-colors group/link"
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
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-16 sm:pb-24 pt-8 md:pt-12">
				<SectionHeader
					label="Credentials"
					icon={ShieldCheck}
					title="Verified Attributes"
					description="Professional certifications and credentials verifying core competencies."
					sectionId="certifications"
				/>

				{certs.length === 0 ? (
					<div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						No verified credentials found.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 md:mt-12 auto-rows-fr"
					>
						{certs.map(cert => (
							<CertCard key={cert.id} cert={cert} />
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}
