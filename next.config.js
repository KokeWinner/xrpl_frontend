// const withImages = require('next-images')
// module.exports = withImages()

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//     enabled: process.env.ANALYZE === 'true',
// })
  
// module.exports = withBundleAnalyzer({ })

const isProd = process.env.RUN_ENV === 'development'
module.exports = {
    poweredByHeader: false,
    assetPrefix: isProd ? 'https://xrpl.to' : '',
	env: {
		API_URL: process.env.API_URL,
		MAINTENANCE: process.env.MAINTENANCE,
	},
	async rewrites() {
		return [
			{
				source: '/most-viewed-tokens',
				destination: '/rankings/most-viewed-tokens',
			},
			{
				source: '/best-tokens',
				destination: '/rankings/best-tokens',
			},
			{
				source: '/trending-tokens',
				destination: '/rankings/trending-tokens',
			},
			{
				source: '/gainers-losers',
				destination: '/rankings/gainers-losers',
			},
			{
				source: '/new',
				destination: '/rankings/new',
			},
		]
	},
	// Add performance optimizations
	reactStrictMode: true,
	compress: true,
	optimizeFonts: true,
	swcMinify: true,
}