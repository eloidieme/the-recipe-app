import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['gourmet.cours.quimerch.com', 'images.unsplash.com'],
  },
  /* config options here */
};

export default nextConfig;
