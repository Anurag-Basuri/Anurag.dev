'use client';

import React from 'react';
import { useBackendStatus } from '@/hooks/use-backend-status';
import { RefreshCw, Info } from 'lucide-react';

export default function ConnectivityBanner() {
	const { status, lastErrorAt, checking, refresh } = useBackendStatus();

	if (status !== 'offline') return null;

	const when = lastErrorAt
		? new Date(lastErrorAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		: 'recently';

	return (
		<div className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-200">
			<div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
				<Info className="h-4 w-4 shrink-0" />
				<p className="text-sm">
					You’re viewing demo content. The backend could not be reached (last check {when}
					).
				</p>
				<div className="ml-auto flex items-center gap-2">
					<button
						onClick={refresh}
						disabled={checking}
						className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-400/40 hover:bg-amber-400/10 disabled:opacity-60"
					>
						<RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
						{checking ? 'Checking…' : 'Retry'}
					</button>
				</div>
			</div>
		</div>
	);
}
