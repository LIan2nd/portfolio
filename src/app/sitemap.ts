import type { MetadataRoute } from "next";
import { PROFILE_PHOTOS } from "@/lib/profilePhotos";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date("2026-08-29T00:00:00+07:00"),
      images: PROFILE_PHOTOS.map((photo) => `${SITE_URL}${photo.src}`),
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: new Date("2026-08-29T00:00:00+07:00"),
    },
  ];
}
