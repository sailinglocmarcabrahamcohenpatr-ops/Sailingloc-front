import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "*.staticflickr.com" },
    ],
  },
};

export default nextConfig;
