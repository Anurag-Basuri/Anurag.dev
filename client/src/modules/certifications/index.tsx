'use client';

import { useEffect, useState } from 'react';
import { publicService } from '@/api';
import type { Certification } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { ShieldCheck, Award, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';

export function CertificationModule() {
	const [certs, setCerts] = useState<Certification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCerts() {
			try {
				const { data } = await publicService.getCertifications();
				setCerts(data || []);
			} catch (err) {
				console.error('Failed to load certifications', err);
			} finally {
				setLoading(false);
			}
		}
		fetchCerts();
	}, []);

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
						className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
					>
						{certs.map(cert => (
							<motion.div
								key={cert.id}
								variants={staggerItem}
								whileHover={{ y: -8, scale: 1.02 }}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}
								className="group relative flex flex-col h-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-emerald-500/30 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_0px_rgba(16,185,129,0.15)]"
							>
								{/* Ambient Glow */}
								<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

								<div className="p-8 relative z-10 flex flex-col h-full">
									<div className="flex justify-between items-start gap-4 mb-8">
										<div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
											<Award className="w-8 h-8 text-emerald-400" />
										</div>

										{/* Issuer Badge */}
										<div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-inner">
											<span className="text-xs font-black uppercase tracking-widest text-emerald-400">
												{cert.issuer}
											</span>
										</div>
									</div>

									<h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors mb-4">
										{cert.title}
									</h3>

									<div className="flex items-center gap-2 text-xs font-bold font-mono text-muted-foreground mb-6 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
										<Activity className="w-3.5 h-3.5" />
										<span>
											Issued:{' '}
											{new Date(
												cert.startDate ?? cert.createdAt,
											).getFullYear()}
										</span>
									</div>

									{cert.skills && cert.skills.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-8 flex-grow content-start">
											{cert.skills.map(skill => (
												<span
													key={skill}
													className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-black/50 text-muted-foreground/80 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner"
												>
													{skill}
												</span>
											))}
										</div>
									)}

									<div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
										<a
											href={cert.credentialUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors group/link"
										>
											Verify Credential
											<ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
										</a>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}
