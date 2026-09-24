import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pastikan baris output: 'export' dihapus sama sekali
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
