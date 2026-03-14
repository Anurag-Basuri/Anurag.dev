'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useApi } from '@/api';
import type { AdminInfo } from '@/api/services/auth';

export default function AdminDashboardPage() {
	const router = useRouter();
	const { logout, getMe } = useAuth();

	const fetcher = useCallback(() => getMe(), [getMe]);
	const { data: admin, loading, error } = useApi<AdminInfo>(fetcher);

	async function handleLogout() {
		await logout();
		router.push('/admin/login');
	}

	return (
		<div className="min-h-screen bg-[#020202] text-white p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold">Admin Dashboard</h1>
						<p className="text-zinc-500 text-sm mt-1">Manage your portfolio content</p>
					</div>
					<button
						onClick={handleLogout}
						className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
					>
						Sign Out
					</button>
				</div>

				{/* Admin Info */}
				{loading && (
					<div className="flex items-center gap-2 text-zinc-500">
						<div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
						Loading admin info...
					</div>
				)}

				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
						{error}
					</div>
				)}

				{admin && (
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-zinc-500">Admin ID</span>
								<p className="text-white mt-1 font-mono">{admin.adminId}</p>
							</div>
							<div>
								<span className="text-zinc-500">Role</span>
								<p className="text-white mt-1">{admin.role}</p>
							</div>
						</div>
					</div>
				)}

				{/* Quick Links */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{[
						{ label: 'Projects', count: '—' },
						{ label: 'Blog Posts', count: '—' },
						{ label: 'Journey', count: '—' },
						{ label: 'Achievements', count: '—' },
						{ label: 'Certifications', count: '—' },
						{ label: 'Messages', count: '—' },
					].map((item) => (
						<div
							key={item.label}
							className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
						>
							<p className="text-zinc-400 text-sm">{item.label}</p>
							<p className="text-2xl font-bold mt-1">{item.count}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
