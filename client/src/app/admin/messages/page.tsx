'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import type { ContactMessage } from '@/types/schema';

export default function MessagesPage() {
	const fetcher = useCallback(() => adminService.getMessages(), []);
	const { data: messages, loading, refetch } = useApi<ContactMessage[]>(fetcher);

	const [selected, setSelected] = useState<ContactMessage | null>(null);

	async function handleDelete(msg: ContactMessage) {
		if (!confirm(`Delete message from "${msg.name}"?`)) return;
		try {
			await adminService.deleteMessage(msg.id);
			if (selected?.id === msg.id) setSelected(null);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Messages</h1>
				<span className="text-sm text-zinc-500">{messages?.length ?? 0} total</span>
			</div>

			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : !messages?.length ? (
				<div className="border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">No messages yet</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
					{/* List */}
					<div className="lg:col-span-2 border border-zinc-800 rounded-lg overflow-hidden max-h-[70vh] overflow-y-auto">
						{messages.map((msg) => (
							<button
								key={msg.id}
								onClick={() => setSelected(msg)}
								className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors ${
									selected?.id === msg.id ? 'bg-zinc-900' : ''
								}`}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium text-sm text-white truncate">{msg.name}</span>
									{!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
								</div>
								<p className="text-xs text-zinc-500 truncate mt-0.5">{msg.subject}</p>
								<p className="text-xs text-zinc-600 mt-0.5">{new Date(msg.createdAt).toLocaleDateString()}</p>
							</button>
						))}
					</div>

					{/* Detail */}
					<div className="lg:col-span-3 border border-zinc-800 rounded-lg p-6">
						{selected ? (
							<>
								<div className="flex items-start justify-between mb-4">
									<div>
										<h2 className="text-lg font-semibold">{selected.subject}</h2>
										<p className="text-sm text-zinc-400 mt-1">
											From <span className="text-white">{selected.name}</span> &lt;{selected.email}&gt;
										</p>
										<p className="text-xs text-zinc-600 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
									</div>
									<button
										onClick={() => handleDelete(selected)}
										className="px-3 py-1.5 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
									>
										Delete
									</button>
								</div>
								<div className="border-t border-zinc-800 pt-4">
									<p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
								</div>
							</>
						) : (
							<div className="h-full flex items-center justify-center text-zinc-600 text-sm">
								Select a message to view
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
