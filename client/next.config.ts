import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	// reactCompiler: true,
	devIndicators: {
		position: 'bottom-right',
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'placehold.co',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'raw.githubusercontent.com',
			},
		],
	},
};

export default nextConfig;
