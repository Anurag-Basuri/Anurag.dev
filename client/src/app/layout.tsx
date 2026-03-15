import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import { Scene3D } from '@/design-system/background/Scene3D';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnuragOS | Portfolio',
  description:
    'Interactive developer portfolio — Full Stack Engineer, Open Source contributor.',
  keywords: ['portfolio', 'developer', 'full-stack', 'React', 'Next.js'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          {/* 3D Animated Background — rendered globally behind all pages */}
          <Scene3D />

          {children}
        </AppProviders>
      </body>
    </html>
  );
}

