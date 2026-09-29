/** @type {import('next').NextConfig} */
const supabaseProjectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Public product and site media are delivered directly from the public
    // Supabase Storage bucket instead of being optimized through Next.js.
    // This avoids the repeated /_next/image fetches and timeouts that were
    // appearing when the app was routing public product media through the
    // Next optimizer.
    unoptimized: true,
    remotePatterns: supabaseProjectRef
      ? [
          {
            protocol: "https",
            hostname: supabaseProjectRef,
            pathname: "/storage/v1/object/**",
          },
        ]
      : [],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/.next/**", "**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
