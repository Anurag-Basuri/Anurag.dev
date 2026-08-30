import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { AppProviders } from '@/layout/AppProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: {
		default: 'Anurag Basuri | Full Stack Engineer & AI Systems',
		template: '%s | Anurag Basuri',
	},
	description:
		'Interactive developer portfolio of Anurag Basuri. Full Stack Engineer specializing in AI agent systems, LangGraph, RAG pipelines, and production-grade distributed architectures.',
	keywords: [
		'Anurag Basuri',
		'portfolio',
		'full-stack engineer',
		'AI agent',
		'LangGraph',
		'RAG',
		'Next.js',
		'FastAPI',
		'React',
	],
	authors: [{ name: 'Anurag Basuri', url: 'https://anuragbasuri.vercel.app' }],
	creator: 'Anurag Basuri',
	metadataBase: new URL('https://anuragbasuri.vercel.app'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://anuragbasuri.vercel.app',
		siteName: 'Anurag Basuri Portfolio',
		title: 'Anurag Basuri | Full Stack Engineer & AI Systems',
		description:
			'Interactive developer portfolio. AI agent systems, LangGraph, RAG pipelines, and production-grade distributed architectures.',
	},
	twitter: {
		card: 'summary',
		title: 'Anurag Basuri | Full Stack Engineer & AI Systems',
		description:
			'Interactive developer portfolio. AI agents, LangGraph, RAG, and distributed systems.',
		creator: '@anurag_basuri',
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className} style={{ background: '#020409' }}>
				<AppProviders>
					{children}
				</AppProviders>
				<Analytics />
			</body>
		</html>
	);
}