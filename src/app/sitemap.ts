import type { MetadataRoute } from "next";
import { SITE_URL, LAST_MODIFIED } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
