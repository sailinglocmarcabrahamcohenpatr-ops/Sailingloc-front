import type { MetadataRoute } from "next";
import { ALL_BOATS } from "@/entities/boat";
import { getDestinations } from "@/entities/destination";
import { APP_URL } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const boatUrls: MetadataRoute.Sitemap = ALL_BOATS.map((boat) => ({
    url: `${APP_URL}/bateaux/${boat.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const destinationUrls: MetadataRoute.Sitemap = getDestinations().map((dest) => ({
    url: `${APP_URL}/destinations/${dest.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${APP_URL}/bateaux`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/destinations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/proprietaire`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/comment-ca-marche`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/cgu`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/plan-du-site`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...destinationUrls,
    ...boatUrls,
  ];
}
