import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/layout/AppProviders';
// import { Scene3D } from '@/theme/Scene3D';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Anurag\'S Portfolio',
	description: 'Interactive developer portfolio — Full Stack Engineer, Open Source contributor.',
	keywords: ['portfolio', 'developer', 'full-stack', 'React', 'Next.js'],
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
					{/* <Scene3D /> */}
					{children}
				</AppProviders>
			</body>
		</html>
	);
}
