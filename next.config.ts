import type { NextConfig } from "next"

/**
 * Statikus export a GitHub Pageshez. A GitHub Pages a projektoldalt egy
 * almappában szolgálja ki (pl. /Szancsi_lakokocsi), ezt a build a
 * NEXT_PUBLIC_BASE_PATH változóból kapja (a GitHub Actions workflow állítja be).
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: {
    // Statikus tárhelyen nincs képoptimalizáló szerver: a képek változatlanul kerülnek ki.
    unoptimized: true,
  },
}

export default nextConfig
