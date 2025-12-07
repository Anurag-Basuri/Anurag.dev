'use client';

import { useEffect, useState } from 'react';
import { api, JourneyEntry } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

const categoryColors: Record<string, string> = {
	education: 'text-blue-400 border-blue-400',
	work: 'text-green-400 border-green-400',
	project: 'text-purple-400 border-purple-400',
	achievement: 'text-yellow-400 border-yellow-400',
};

export function JourneyModule() {
	const [journey, setJourney] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		api.getJourney()
			.then(data => setJourney(data.items))
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="p-6 flex items-center justify-center h-full">
				<div className="text-muted-foreground">Loading journey...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 flex items-center justify-center h-full">
				<div className="text-red-500">Error: {error}</div>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-green-500 mb-2 flex items-center gap-2">
						<span className="text-blue-400">$</span> cat journey/timeline.md
					</h1>
					<p className="text-white/60">My professional journey</p>
				</div>

				<div className="relative space-y-6 pl-8">
					{/* Timeline line - gradient */}
					<div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>

					{journey.map((entry, index) => (
						<div key={entry.id} className="relative">
							{/* Timeline dot with glow */}
							<div className="absolute -left-[26px] top-2 w-3 h-3 rounded-full bg-green-500 border-2 border-black shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>

							<div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-5 hover:border-green-500/50 hover:shadow-lg transition-all">
								<div className="flex items-start justify-between mb-3">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<span className="text-3xl font-bold text-green-400">
												{entry.year}
											</span>
											<span
												className={`px-3 py-1 border rounded-full text-xs uppercase font-semibold ${
													categoryColors[entry.category] ||
													'text-white/60 border-white/20'
												}`}
											>
												{entry.category}
											</span>
										</div>
										<h2 className="text-xl font-bold text-white mb-2">
											{entry.title}
										</h2>
									</div>
								</div>

								<p className="text-sm text-white/70 leading-relaxed">
									{entry.description}
								</p>
							</div>
						</div>
					))}
				</div>

				{journey.length === 0 && (
					<div className="text-center py-12 text-white/60">
						<p>No journey entries found.</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
