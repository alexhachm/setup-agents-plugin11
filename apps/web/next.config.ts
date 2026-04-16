import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@plugin11/shared",
    "@plugin11/db",
    "@plugin11/editor-extensions",
  ],
};

export default nextConfig;
