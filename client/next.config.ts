import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true,

	outputFileTracingRoot: path.join(__dirname, '..'),

	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},

	// Image optimization
	images: {
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 60,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	// Bundle analyzer (optional - enable when needed)
	// webpack: (config, { isServer }) => {
	// 	if (!isServer) {
	// 		config.optimization.splitChunks = {
	// 			chunks: 'all',
	// 			cacheGroups: {
	// 				default: false,
	// 				vendors: false,
	// 				commons: {
	// 					name: 'commons',
	// 					chunks: 'all',
	// 					minChunks: 2,
	// 				},
	// 			},
	// 		};
	// 	}
	// 	return config;
	// },

	// Experimental features
	experimental: {
		optimizePackageImports: ['@/components', 'lucide-react', 'framer-motion', 'gsap'],
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
