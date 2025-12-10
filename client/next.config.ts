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
		],
	},
};

export default nextConfig;
