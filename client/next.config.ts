import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true,

	outputFileTracingRoot: path.join(__dirname, '..'),

	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
	},

	// Image optimization
	images: {
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 60,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: '**',
			},
		],
	},

	// Static redirect for homepage (avoids force-dynamic server function)
	async redirects() {
		return [
			{
				source: '/',
				destination: '/portfolio',
				permanent: false,
			},
		];
	},

	// Experimental features
	experimental: {
		optimizePackageImports: ['lucide-react', 'framer-motion'],
	},

	// Headers for better caching
	async headers() {
		return [
			{
				source: '/:all*(svg|jpg|png|webp|avif)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},
};

export default nextConfig;
