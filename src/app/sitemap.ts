import type { MetadataRoute } from "next";
import { PROFILE_PHOTOS } from "@/lib/profilePhotos";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      images: PROFILE_PHOTOS.map((photo) => `${SITE_URL}${photo.src}`),
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
