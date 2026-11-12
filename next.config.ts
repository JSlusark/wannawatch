import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image only shows outside images from addresses listed here.
    // The movie API's posters live on *.trakt.tv (e.g. media.trakt.tv)
    remotePatterns: [{ protocol: "https", hostname: "**.trakt.tv" }],
  },
  // The landing page (now at /welcome) is hidden until sign up exists, so the
  // home address sends people straight into the app. The server answers before
  // any page renders, so nothing flashes. "permanent: false" (307) because the
  // landing page will come back, so browsers must not remember this redirect
  async redirects() {
    return [{ source: "/", destination: "/catalogue", permanent: false }];
  },
};

export default nextConfig;
