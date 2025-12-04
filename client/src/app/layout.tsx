import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/core/ErrorBoundary';
import ConnectivityBanner from '@/components/core/ConnectivityBanner';
import ClientToaster from '@/components/core/ClientToaster';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'AnuragOS - Developer Portfolio',
	description: 'A terminal-style portfolio showcasing projects, journey, and skills',
	icons: [{ rel: 'icon', url: '/favicon.ico' }],
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
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<ErrorBoundary>
						<ConnectivityBanner />
						<ClientToaster />
						{children}
					</ErrorBoundary>
				</ThemeProvider>
			</body>
		</html>
	);
}
