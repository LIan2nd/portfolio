import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LIand — Alfian Nur Usyaid",
    short_name: "LIand",
    description:
      "Portfolio of Alfian Nur Usyaid (LIand) — Fullstack Developer in Next.js, Laravel, and Blockchain.",
    start_url: "/",
    display: "standalone",
    background_color: "#021526",
    theme_color: "#021526",
    icons: [
      {
        src: "/icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
