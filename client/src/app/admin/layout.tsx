'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/api';
import { AdminNav } from './components/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { isAuthenticated } = useAuth();
	const [checked, setChecked] = useState(false);

	const isLoginPage = pathname === '/admin/login';

	useEffect(() => {
		if (isLoginPage) {
			setChecked(true);
			return;
		}
		if (!isAuthenticated) {
			router.replace('/admin/login');
			return;
		}
		setChecked(true);
	}, [isAuthenticated, isLoginPage, router]);

	if (!checked) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#020202]">
				<div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
			</div>
		);
	}

	// Login page — no sidebar
	if (isLoginPage) return <>{children}</>;

	return (
		<div className="h-screen flex bg-[#020202] text-white overflow-hidden">
			<AdminNav />
			<main className="flex-1 overflow-y-auto p-8 pb-16">{children}</main>
		</div>
	);
}
