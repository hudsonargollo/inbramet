import type { NextConfig } from "next";
import path from "node:path";

// Self-contained build output for Node.js standalone deployment.
const nextConfig: NextConfig = {
  // Product photos are replaced in place; keep the optimizer cache
  // short so swaps propagate to browsers/CDN quickly.
  images: {
    minimumCacheTTL: 60,
  },
  output: "standalone",

  // Pin the workspace root to this project so Next.js doesn't pick up
  // an unrelated package-lock.json from a parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Custom-design requests carry up to 3 reference photos (shrunk in the browser
  // to ~0.2–0.6 MB each). Default is 1 MB; cap at 4 MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  // Make sure the Prisma query engine binaries ship with the server functions.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*"],
  },
};

export default nextConfig;
