import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Fotos de producto: hasta ~5 MB cada una y varias por envío, más el
      // overhead de multipart.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
