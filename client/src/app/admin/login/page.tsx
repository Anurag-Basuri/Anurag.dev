'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/api';
import { loginSchema } from '@/api';
import type { LoginFormData } from '@/api';
import { ApiClientError } from '@/api';

export default function AdminLoginPage() {
	const router = useRouter();
	const { login, isAuthenticated } = useAuth();

	const [form, setForm] = useState<LoginFormData>({ username: '', password: '' });
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
	const [loading, setLoading] = useState(false);

	// Redirect if already authenticated
	if (isAuthenticated) {
		router.replace('/admin');
		return null;
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
		setError(null);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setFieldErrors({});

		// Validate
		const result = loginSchema.safeParse(form);
		if (!result.success) {
			const errors: Partial<Record<keyof LoginFormData, string>> = {};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as keyof LoginFormData;
				if (!errors[field]) errors[field] = issue.message;
			});
			setFieldErrors(errors);
			return;
		}

		setLoading(true);
		try {
			await login(result.data.username, result.data.password);
			router.push('/admin');
		} catch (err) {
			if (err instanceof ApiClientError) {
				setError(err.message);
			} else {
				setError('An unexpected error occurred. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#020202] px-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
					<p className="text-zinc-500 text-sm">Sign in to manage your portfolio</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Global error */}
					{error && (
						<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
							{error}
						</div>
					)}

					{/* Username */}
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-zinc-400 mb-1.5">
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							autoComplete="username"
							autoFocus
							value={form.username}
							onChange={handleChange}
							className={`w-full px-4 py-3 rounded-lg bg-zinc-900 border text-white placeholder-zinc-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${
								fieldErrors.username ? 'border-red-500/50' : 'border-zinc-800 hover:border-zinc-700'
							}`}
							placeholder="Enter username"
						/>
						{fieldErrors.username && (
							<p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
						)}
					</div>

					{/* Password */}
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-1.5">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							value={form.password}
							onChange={handleChange}
							className={`w-full px-4 py-3 rounded-lg bg-zinc-900 border text-white placeholder-zinc-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${
								fieldErrors.password ? 'border-red-500/50' : 'border-zinc-800 hover:border-zinc-700'
							}`}
							placeholder="Enter password"
						/>
						{fieldErrors.password && (
							<p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
						)}
					</div>

					{/* Submit */}
					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			</div>
		</div>
	);
}
