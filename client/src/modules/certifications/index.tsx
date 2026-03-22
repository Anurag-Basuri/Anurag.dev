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
		<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto animate-pulse pb-16">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="h-48 bg-foreground/5 rounded-xl" />
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
			className="group relative flex flex-col h-full bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40 shadow-lg"
		>
			<div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/8 transition-colors duration-300 pointer-events-none" />

			{/* Thumbnail — edge-to-edge */}
			<div className="relative aspect-video overflow-hidden bg-card">
				<UrlThumbnail
					url={cert.certificateUrl || cert.credentialUrl}
					title={`${cert.title} certificate`}
					fallbackIcon={Award}
					fallbackLabel={cert.issuer}
					fallbackGradient="from-cyan-950/60"
				/>
				<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
			</div>

			<div className="p-3 relative z-10 flex flex-col grow">
				{/* Issuer Badge */}
				<div className="flex items-center gap-1.5 mb-2">
					<ShieldCheck className="w-3 h-3 text-cyan-400" />
					<span className="text-[9px] font-black uppercase tracking-widest text-foreground/80">
						{cert.issuer}
					</span>
				</div>

				<h3 className="text-sm font-black text-foreground tracking-tight leading-tight group-hover:text-cyan-400 transition-colors mb-1.5 line-clamp-2">
					{cert.title}
				</h3>

				<div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-cyan-400/70 mb-2.5">
					<Activity className="w-3 h-3" />
					<span>Issued: {new Date(cert.startDate ?? cert.createdAt).getFullYear()}</span>
				</div>

				{(cert.skills ?? []).length > 0 && (
					<div className="flex flex-wrap gap-1.5 mb-2.5 grow content-start">
						{(cert.skills ?? []).slice(0, 4).map(skill => (
							<span
								key={skill}
								className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md bg-foreground/5 text-muted-foreground border border-border group-hover:border-cyan-500/30 group-hover:text-foreground/90 transition-colors"
							>
								{skill}
							</span>
						))}
					</div>
				)}

				{cert.credentialUrl && (
					<div className="mt-auto pt-2.5 border-t border-border">
						<a
							href={cert.credentialUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-cyan-400 transition-colors group/link"
							aria-label={`Verify credential for ${cert.title}`}
						>
							Verify
							<ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
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
			<div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto pb-10 sm:pb-14 pt-6 md:pt-8">
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
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6"
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
