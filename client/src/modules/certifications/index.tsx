'use client';

import { useEffect, useState, memo } from 'react';
import { publicService } from '@/api';
import type { Certification } from '@/api/schema';

import { ShieldCheck, Award, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { SpotlightCard } from '@/ui/SpotlightCard';

// ─── Skeleton ───────────────────────────────────────────────────

function CertificationsSkeleton() {
	return (
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-12 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
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
		<motion.div variants={staggerItem} className="h-full flex flex-col">
			<SpotlightCard
				tilt={true}
				className="group relative flex flex-col h-full rounded-2xl border border-border/60 hover:border-primary/40 bg-card/40 backdrop-blur-xl transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
			>
				{/* Thumbnail — edge-to-edge */}
				<div className="relative aspect-video overflow-hidden bg-surface-2/40">
					<UrlThumbnail
						url={cert.certificateUrl || cert.credentialUrl}
						title={cert.title + ' certificate'}
						fallbackIcon={Award}
					/>
					<div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
				</div>

				<div className="p-4 relative z-10 flex flex-col grow">
					{/* Issuer Badge */}
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-1.5">
							<ShieldCheck className="w-3.5 h-3.5 text-primary" />
							<span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
								{cert.issuer}
							</span>
						</div>
						<span className="text-[10px] font-mono text-muted-foreground bg-surface-2 px-2 py-0.5 rounded">
							{new Date(cert.startDate ?? cert.createdAt).getFullYear()}
						</span>
					</div>

					<h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2 font-sans">
						{cert.title}
					</h3>

					{(cert.skills ?? []).length > 0 && (
						<div className="flex flex-wrap gap-1.5 mb-3 grow content-start">
							{(cert.skills ?? []).slice(0, 4).map(skill => (
								<span
									key={skill}
									className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-surface-2 border border-border/50 text-muted-foreground"
								>
									{skill}
								</span>
							))}
						</div>
					)}

					{cert.credentialUrl && (
						<div className="mt-auto pt-3 border-t border-border/40">
							<a
								href={cert.credentialUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-xs font-mono font-medium uppercase tracking-wide text-primary hover:underline group/link"
								aria-label={'Verify credential for ' + cert.title}
							>
								<span>Verify Official Credential</span>
								<ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
							</a>
						</div>
					)}
				</div>
			</SpotlightCard>
		</motion.div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function CertificationModule() {
	const [certs, setCerts] = useState<Certification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		async function fetchCerts() {
			try {
				const { data } = await publicService.getCertifications();
				if (!cancelled) setCerts(data || []);
			} catch (err) {
				console.error('Failed to load certifications', err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchCerts();
		return () => { cancelled = true; };
	}, []);

	if (loading) return <CertificationsSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-2 md:pt-3">
				<SectionHeader
					icon={ShieldCheck}
					index="05"
					tag="LICENSES"
					title="Verified Credentials"
					description="Professional certifications and credentials verifying core engineering competencies."
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
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5 mt-4"
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