'use client';

import type { ReactNode } from 'react';
import { Provider, createStore } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { ThemeContextProvider } from '@/theme/colors/theme-context';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { BackgroundRenderer } from '@/theme/backgrounds/BackgroundRenderer';
import { AgentPromoBadge } from '@/layout/AgentPromoBadge';
import { CustomCursor } from '@/ui/CustomCursor';
import { BootGuard } from '@/boot/components/BootGuard';

const jotaiStore = createStore();

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<Provider store={jotaiStore}>
			<ThemeContextProvider>
				<ErrorBoundary label="App Root">
					<BackgroundRenderer />
					<CustomCursor />
					<BootGuard>
						{children}
					</BootGuard>
					<AgentPromoBadge />

					<Toaster
						position="top-right"
						toastOptions={{
							duration: 3500,
							className:
								'!rounded-xl !border !border-border !bg-background/90 !text-white !backdrop-blur-xl !shadow-2xl',
						}}
					/>
				</ErrorBoundary>
			</ThemeContextProvider>
		</Provider>
	);
}

