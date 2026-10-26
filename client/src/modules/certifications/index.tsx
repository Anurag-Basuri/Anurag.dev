'use client';

import { useEffect, useState } from 'react';
import { publicService } from '@/api';
import type { Certification } from '@/api/schema';
import { ShieldCheck, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';

function CertificationsSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
			<div className="h-6 w-32 bg-foreground/5 rounded-md" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="h-48 bg-foreground/5 rounded-2xl" />
				))}
			</div>
		</div>
	);
}

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

	if (loading && certs.length === 0) return <CertificationsSkeleton />;

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 05 · Section Header */}
				<SectionHeader
					icon={ShieldCheck}
					index="05"
					tag="CREDENTIALS"
					title="Verified Certifications"
					description="Engineering specializations and verified credentials from accredited institutions."
					sectionId="certifications"
				/>

				{certs.length === 0 ? (
					<div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-card/10 mt-6">
						<p className="text-muted-foreground text-sm font-mono">No certifications recorded yet.</p>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-6"
					>
						{certs.map((cert, idx) => {
							const link = cert.credentialUrl || cert.certificateUrl;

							return (
								<motion.div
									key={cert.id || idx}
									variants={staggerItem}
									className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-7 hover:border-border/80 transition-all duration-300 shadow-xs hover:shadow-md"
								>
									<div>
										{/* Top Header */}
										<div className="flex items-center justify-between gap-2 mb-3">
											<div className="flex items-center gap-2">
												<span className="font-mono text-xs text-primary/90 font-medium">
													// 0{idx + 1}
												</span>
												<span className="text-border/60">·</span>
												<span className="font-mono text-xs text-foreground/80 font-medium">
													{cert.issuer}
												</span>
											</div>

											{cert.startDate && (
												<span className="text-[11px] font-mono text-muted-foreground/60">
													{new Date(cert.startDate).getFullYear()}
												</span>
											)}
										</div>

										<h3 className="text-xl font-light tracking-tight text-foreground/95 font-sans group-hover:text-primary transition-colors mb-2">
											{cert.title}
										</h3>

										{cert.description && (
											<p className="text-sm text-foreground/80 leading-relaxed font-normal mb-4">
												{cert.description}
											</p>
										)}
									</div>

									<div>
										{/* Skills */}
										{(cert.skills ?? []).length > 0 && (
											<div className="flex flex-wrap items-center gap-1.5 mb-4">
												{(cert.skills ?? []).map(skill => (
													<span
														key={skill}
														className="px-2.5 py-1 rounded-lg text-xs font-mono bg-foreground/[0.03] text-muted-foreground/80 border border-border/30"
													>
														{skill}
													</span>
												))}
											</div>
										)}

										{/* Credential Action */}
										{link && (
											<div className="pt-3 border-t border-border/20">
												<a
													href={link}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-xs font-mono text-primary/80 hover:text-primary transition-colors"
												>
													<span>Verify Official Credential</span>
													<ArrowUpRight className="w-3.5 h-3.5" />
												</a>
											</div>
										)}
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</div>
	);
}