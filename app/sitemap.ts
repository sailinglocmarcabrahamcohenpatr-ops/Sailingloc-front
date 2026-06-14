import type { MetadataRoute } from "next";
import { ALL_BOATS } from "@/entities/boat";
import { APP_URL } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const boatUrls: MetadataRoute.Sitemap = ALL_BOATS.map((boat) => ({
    url: `${APP_URL}/bateaux/${boat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${APP_URL}/bateaux`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...boatUrls,
  ];
}
