import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image only shows outside images from addresses listed here.
    // The movie API's posters live on *.trakt.tv (e.g. media.trakt.tv)
    remotePatterns: [{ protocol: "https", hostname: "**.trakt.tv" }],
  },
};

export default nextConfig;
