import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true, // Required for static export
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
  assetPrefix: process.env.NODE_ENV === "production" ? undefined : undefined,
  trailingSlash: true,
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "metadata" }],
    ],
  },
});

export default withMDX(nextConfig);
