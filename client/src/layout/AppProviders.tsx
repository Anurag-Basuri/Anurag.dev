'use client';

import type { ReactNode } from 'react';
import { Provider, createStore } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { ThemeContextProvider } from '@/theme/theme-context';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

const jotaiStore = createStore();

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<Provider store={jotaiStore}>
			<ThemeContextProvider>
				<ErrorBoundary label="App Root">
					{children}

					<Toaster
						position="top-right"
						toastOptions={{
							duration: 3500,
							className:
								'!rounded-xl !border !border-white/10 !bg-black/90 !text-white !backdrop-blur-xl !shadow-2xl',
						}}
					/>
				</ErrorBoundary>
			</ThemeContextProvider>
		</Provider>
	);
}
