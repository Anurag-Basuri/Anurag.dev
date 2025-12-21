'use client';

import type { ReactNode } from 'react';
import { Provider, createStore } from 'jotai';
import { useMemo } from 'react';

export const JotaiProvider = ({ children }: { children: ReactNode }) => {
	const store = useMemo(() => createStore(), []);
	return <Provider store={store}>{children}</Provider>;
};
