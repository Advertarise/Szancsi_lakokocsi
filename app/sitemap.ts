import type { MetadataRoute } from "next"

import { camper } from "@/content/camper"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const legalUpdated = new Date(camper.legal.lastUpdated)
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1, images: [`${siteUrl}${camper.hero.image}`] },
    { url: `${siteUrl}/aszf`, lastModified: legalUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/adatvedelem`, lastModified: legalUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/lemondasi-feltetelek`, lastModified: legalUpdated, changeFrequency: "yearly", priority: 0.3 },
  ]
}
