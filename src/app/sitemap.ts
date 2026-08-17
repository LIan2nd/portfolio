import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://portfolio.liand.web.id",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        "https://portfolio.liand.web.id/img/profile/profile-1.png",
        "https://portfolio.liand.web.id/img/profile/profile-2.jpg",
        "https://portfolio.liand.web.id/img/profile/profile-3.jpg",
        "https://portfolio.liand.web.id/img/profile/profile-4.jpg",
      ],
    },
    {
      url: "https://portfolio.liand.web.id/file/resume.pdf",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://portfolio.liand.web.id/resume.pdf",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://portfolio.liand.web.id/llms.txt",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://portfolio.liand.web.id/llms-full.txt",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
