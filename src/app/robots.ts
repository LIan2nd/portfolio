import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "Googlebot",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Bytespider",
          "CCBot",
          "cohere-ai",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://portfolio.liand.web.id/sitemap.xml",
  };
}
