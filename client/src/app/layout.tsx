import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '../components/shared/error-boundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { JotaiProvider } from '@/components/providers/jotai-provider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

export const metadata: Metadata = {
	title: 'Anurag - Developer Portfolio',
	description: 'A terminal-style portfolio showcasing projects, journey, and skills',
	icons: [{ rel: 'icon', url: '/logo.png' }],
	metadataBase: typeof window === 'undefined' ? new URL('http://localhost:3000') : undefined,
	openGraph: {
		title: 'Personal Portfolio',
		description: 'Showcasing projects, journey, and blog.',
		type: 'website',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#000000',
};

// Ensure the returned markup has html/body and suppressHydrationWarning on <html> to avoid minor client-only diffs.
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
				/>
				{/* Resource hints for better performance */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<JotaiProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<ErrorBoundary>
							<Suspense
								fallback={
									<div className="fixed inset-0 bg-black flex items-center justify-center">
										<div className="w-8 h-8 border-4 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin" />
									</div>
								}
							>
								{children}
							</Suspense>
						</ErrorBoundary>
					</ThemeProvider>
				</JotaiProvider>
			</body>
		</html>
	);
}
