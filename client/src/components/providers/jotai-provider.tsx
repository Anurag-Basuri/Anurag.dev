'use client';

import { Provider, createStore } from 'jotai';
import { useMemo } from 'react';

export const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
	const store = useMemo(() => createStore(), []);
	return <Provider store={store}>{children}</Provider>;
};
