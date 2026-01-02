import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { JotaiProvider } from '@/components/providers/jotai-provider';
import { BootGuard } from '@/components/layout/BootGuard';
import { Inter } from 'next/font/google';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
});

export const metadata: Metadata = {
	title: {
		default: 'Anurag Basuri | Software Developer',
		template: '%s | Anurag Basuri',
	},
	description:
		'Full-stack engineer passionate about building elegant solutions. Explore my portfolio of web applications, AI experiments, and technical articles.',
	keywords: [
		'Anurag Basuri',
		'Full Stack Engineer',
		'Web Developer',
		'Portfolio',
		'React',
		'Next.js',
		'TypeScript',
		'AI',
		'Machine Learning',
	],
	authors: [{ name: 'Anurag Basuri', url: 'https://github.com/Anurag-Basuri' }],
	creator: 'Anurag Basuri',
	metadataBase: new URL('https://anuragbasuri.com'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://anuragbasuri.com',
		siteName: 'Anurag Basuri Portfolio',
		title: 'Anurag Basuri | Full Stack Engineer',
		description:
			'Full-stack engineer passionate about building elegant solutions. Explore my portfolio of web applications, AI experiments, and technical articles.',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Anurag Basuri Portfolio',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Anurag Basuri | Full Stack Engineer',
		description: 'Full-stack engineer passionate about building elegant solutions.',
		creator: '@AnuragBasuri',
		images: ['/og-image.png'],
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
							/* Hide the overlay once React hydrates and BootScreen takes over */
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
