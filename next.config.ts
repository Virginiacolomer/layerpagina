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
      // Las fotos se achican en el navegador (ver src/lib/image-resize.ts), así
      // que el body real es de cientos de KB. En Vercel el límite duro de la
      // plataforma es ~4,5 MB igual; esto es sólo el tope de Next.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
