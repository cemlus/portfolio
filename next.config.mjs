/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // Deploying to GitHub Pages at username.github.io/repo-name rather than a
  // custom domain? Uncomment these, or the CSS and JS 404:
  // basePath: '/repo-name',
  // assetPrefix: '/repo-name',
};

export default nextConfig;
