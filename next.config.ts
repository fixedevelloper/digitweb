import type { NextConfig } from "next";

// `optimizeFonts` a été retiré de la config Next.js (obsolète depuis Next 13,
// non reconnu depuis Next 16) — l'optimisation des polices Google se
// désactive désormais au niveau de chaque appel next/font si nécessaire.
const nextConfig: NextConfig = {
  // Serveur autonome minimal pour l'image Docker de production (deploy/dashboard/Dockerfile).
  // Sans effet sur `next dev`.
  output: "standalone",
};

export default nextConfig;