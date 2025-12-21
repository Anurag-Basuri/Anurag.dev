'use client';

import { useEffect, useState } from 'react';
import { api, Certification } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModuleError } from '@/components/ui/module-error';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { ModuleHeader } from '@/modules/shared/ModuleHeader';

function CertificationsSkeleton() {
	return (
		<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20 animate-pulse">
			<div className="mb-10 border-b border-border/40 pb-6">
				<div className="h-4 bg-muted rounded w-32 mb-2" />
				<div className="h-8 bg-muted rounded w-64" />
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="p-6 rounded-2xl bg-card/20 border border-border/40">
						<div className="flex justify-between items-start mb-4">
							<div className="h-12 w-12 bg-muted rounded-xl" />
							<div className="h-4 w-4 bg-muted rounded" />
						</div>
						<div className="h-6 bg-muted rounded w-3/4 mb-2" />
						<div className="h-4 bg-muted rounded w-1/2 mb-4" />
						<div className="h-4 bg-muted rounded w-24 mb-4" />
						<div className="flex gap-2">
							<div className="h-6 w-16 bg-muted rounded" />
							<div className="h-6 w-16 bg-muted rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function CertificationModule() {
	const [certs, setCerts] = useState<Certification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getCertifications();
			setCerts(data);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load certifications';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <CertificationsSkeleton />;

	if (error) return <ModuleError message={error} onRetry={fetchData} />;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20">
				{/* Header */}
				<ModuleHeader
					label="Certifications"
					icon={ShieldCheck}
					title="Verified Attributes"
				/>

				<motion.div
					className="grid gap-6 md:grid-cols-2"
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
				>
					{certs.map(cert => (
						<motion.div
							key={cert.id}
							variants={staggerItem}
							className="group relative overflow-hidden bg-card/40 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
						>
							{/* Hover Gradient */}
							<div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

							<div className="relative z-10 flex flex-col h-full">
								<div className="flex justify-between items-start gap-4 mb-6">
									<div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
										<Award className="w-8 h-8 text-emerald-400" />
									</div>
									<div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
										<span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
											{cert.issuer}
										</span>
									</div>
								</div>

								<div className="mb-auto space-y-3">
									<h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-emerald-400 transition-colors leading-tight">
										{cert.title}
									</h3>
									<div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-mono">
										<Calendar className="w-4 h-4" />
										<span>
											Issued: {new Date(cert.date).toLocaleDateString()}
										</span>
									</div>
								</div>

								{cert.skills && cert.skills.length > 0 && (
									<div className="flex flex-wrap gap-2 my-6 pt-6 border-t border-white/5">
										{cert.skills.map(skill => (
											<span
												key={skill}
												className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-white/5 text-muted-foreground/80 border border-white/5 group-hover:bg-white/10 transition-colors"
											>
												{skill}
											</span>
										))}
									</div>
								)}

								<div className="mt-4 pt-4 flex items-center justify-between border-t border-white/5 group-hover:border-white/10 transition-colors">
									<a
										href={cert.credentialUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors group/link"
									>
										View Credential
										<ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
									</a>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</ScrollArea>
	);
}
