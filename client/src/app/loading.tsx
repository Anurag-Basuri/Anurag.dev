import React from 'react';

// Minimal black screen to prevent white flash before BootGuard takes over
export default function RootLoading() {
	return <div className="min-h-screen bg-[#020202]" />;
}
