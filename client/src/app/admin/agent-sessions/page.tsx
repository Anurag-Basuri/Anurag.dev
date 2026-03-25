'use client';

import { useCallback, useState } from 'react';
import { useApi, adminService } from '@/api';
import type { AgentSession } from '@/api/schema';

export default function AgentSessionsPage() {
	const fetcher = useCallback(() => adminService.getAgentSessions(), []);
	const { data: pageData, loading, refetch } = useApi<any>(fetcher);
	const sessions: AgentSession[] = pageData?.sessions || [];

	const [selected, setSelected] = useState<any | null>(null);

	async function handleDelete(session: any) {
		if (!confirm(`Delete AI session ID ${session.sessionId}?`)) return;
		try {
			await adminService.deleteAgentSession(session.id);
			if (selected?.id === session.id) setSelected(null);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	return (
		<div className="max-w-6xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">AI Agent Sessions</h1>
				<span className="text-sm text-zinc-500">{pageData?.total ?? 0} total sessions</span>
			</div>

			{loading ? (
				<div className="text-zinc-500 animate-pulse">Loading AI histories...</div>
			) : !sessions.length ? (
				<div className="border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
					No active AI sessions recorded. Check back when users chat with the Agent.
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
					{/* Sidebar List */}
					<div className="lg:col-span-4 border border-zinc-800 rounded-lg overflow-hidden h-full flex flex-col">
						<div className="bg-zinc-900 border-b border-zinc-800 p-4">
							<h3 className="font-semibold text-sm">Stored Conversations</h3>
						</div>
						<div className="overflow-y-auto flex-1 p-2 space-y-2">
							{sessions.map((session: any) => (
								<button
									key={session.id}
									onClick={() => setSelected(session)}
									className={`w-full text-left p-4 rounded-lg border transition-colors ${
										selected?.id === session.id
											? 'bg-blue-600/10 border-blue-500/50'
											: 'bg-zinc-950 border-zinc-800/60 hover:bg-zinc-900'
									}`}
								>
									<div className="flex items-center justify-between mb-1">
										<span className="font-medium text-sm text-white truncate">
											Session {session.sessionId.substring(0, 8)}
										</span>
									</div>
									<p className="text-xs text-zinc-500">
										{new Date(session.updatedAt).toLocaleString()}
									</p>
									<p className="text-xs font-mono text-emerald-500/80 mt-2">
										Memory Blocks: {Array.isArray(session.history) ? session.history.length : 0}
									</p>
								</button>
							))}
						</div>
					</div>

					{/* Detail View */}
					<div className="lg:col-span-8 border border-zinc-800 rounded-lg flex flex-col h-full bg-zinc-950 overflow-hidden">
						{selected ? (
							<>
								{/* Detail Header */}
								<div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
									<div>
										<h2 className="text-sm font-bold text-white font-mono">
											{selected.sessionId}
										</h2>
										<p className="text-xs text-zinc-500 mt-1">
											Started at {new Date(selected.createdAt).toLocaleString()}
										</p>
									</div>
									<button
										onClick={() => handleDelete(selected)}
										className="px-3 py-1.5 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors font-medium border border-red-500/20"
									>
										Delete Session
									</button>
								</div>
								
								{/* Messages Timeline */}
								<div className="flex-1 overflow-y-auto p-6 space-y-6">
									{Array.isArray(selected.history) && selected.history.map((msg: any, i: number) => {
										// Crack open Langchain BaseMessage serialized format
										const type = msg.type || msg?.id?.[msg?.id?.length - 1]?.replace('Message', '').toLowerCase();
										const isUser = type === 'human';
										const isAI = type === 'ai';
										const isSystem = type === 'system';
										const isTool = type === 'tool';
										
										// Do not show the massive system prompt to the admin dashboard, it's just visual noise
										if (isSystem) return null;

										// Handle Tool Call records inside AI messages natively
										const hasToolCalls = msg.kwargs?.tool_calls?.length > 0;

										return (
											<div key={i} className={`flex flex-col ${isUser ? 'items-end' : isTool ? 'items-center' : 'items-start'}`}>
												<div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm flex flex-col shadow-sm ${
													isUser ? 'bg-emerald-600 text-white rounded-br-sm' 
													: isTool ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/50 text-xs font-mono w-full break-all shadow-inner'
													: 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700/50'
												}`}>
													
													{isTool && (
														<div className="text-[10px] uppercase font-bold tracking-wider mb-2 opacity-50 border-b border-indigo-900/50 pb-1 w-full">
															[SYS] Tool Execution Result
														</div>
													)}

													{isUser && (
														<div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-60">Visitor</div>
													)}

													{isAI && (
														<div className="text-[10px] uppercase font-bold tracking-wider mb-1 text-emerald-400">Agent</div>
													)}
													
													<div className="whitespace-pre-wrap leading-relaxed">
														{msg.kwargs?.content || msg.content || (isTool ? JSON.stringify(msg) : '')}
													</div>

													{hasToolCalls && (
														<div className="mt-3 pt-3 border-t border-zinc-700/50 flex flex-col gap-2">
															<span className="text-[10px] uppercase text-zinc-500 font-bold">Requested Tools:</span>
															{msg.kwargs.tool_calls.map((tc: any, tIdx: number) => (
																<div key={tIdx} className="bg-zinc-900/50 rounded p-2 text-xs font-mono border border-zinc-800">
																	<span className="text-emerald-400">{tc.name}()</span>
																	<span className="text-zinc-500 ml-2">{JSON.stringify(tc.args)}</span>
																</div>
															))}
														</div>
													)}

												</div>
											</div>
										);
									})}
									{(!Array.isArray(selected.history) || selected.history.length === 0) && (
										<div className="text-center text-zinc-600 mt-10">No messages in this memory block.</div>
									)}
								</div>
							</>
						) : (
							<div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center space-y-4">
								<div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
									<span className="text-2xl opacity-50">💬</span>
								</div>
								<p>Select a session timeline from the sidebar to read exactly what the visitor asked the Artificial Intelligence.</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
