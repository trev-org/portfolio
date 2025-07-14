import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enables static HTML export
  images: {
    unoptimized: true,  // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xzjjgvjhjoyjjkjdguza.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Ensure all assets are properly included in the build
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  trailingSlash: true,
};

export default nextConfig;
