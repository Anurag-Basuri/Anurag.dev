import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { JotaiProvider } from '@/components/providers/jotai-provider';
import { BootGuard } from '@/components/layout/BootGuard';
import { Inter } from 'next/font/google';
import { siteConfig, siteKeywords } from '@/lib/siteConfig';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
});

export const metadata: Metadata = {
	title: {
		default: siteConfig.title,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	keywords: siteKeywords,
	authors: [{ name: siteConfig.name, url: siteConfig.links.github }],
	creator: siteConfig.creator,
	metadataBase: new URL(siteConfig.url),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: siteConfig.url,
		siteName: `${siteConfig.name} Portfolio`,
		title: siteConfig.title,
		description: siteConfig.description,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: `${siteConfig.name} Portfolio`,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: siteConfig.title,
		description: siteConfig.description,
		creator: siteConfig.links.twitter,
		images: [siteConfig.ogImage],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon-16x16.png',
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#020202' },
		{ media: '(prefers-color-scheme: dark)', color: '#020202' },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={inter.variable}>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				{/* Critical CSS: Black screen before JS loads to prevent flash */}
				<style
					dangerouslySetInnerHTML={{
						__html: `
							html, body { background-color: #020202 !important; }
							body::before {
								content: '';
								position: fixed;
								inset: 0;
								background: #020202;
								z-index: 9998;
								pointer-events: none;
								opacity: 1;
								transition: opacity 0.5s ease-out 0.1s;
							}
							body.boot-complete::before {
								opacity: 0;
								pointer-events: none;
							}
							body.hydrated::before {
								opacity: 0;
							}
						`,
					}}
				/>
			</head>
			<body className="antialiased bg-[#020202] text-foreground overflow-hidden">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					<JotaiProvider>
						<BootGuard>{children}</BootGuard>
					</JotaiProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
