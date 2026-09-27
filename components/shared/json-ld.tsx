import { camper } from "@/content/camper"
import { highestNightlyRate, lowestNightlyRate } from "@/lib/pricing"
import { siteUrl } from "@/lib/site"

/** Strukturált adatok a keresőknek (schema.org). */
export function JsonLd() {
  const businessId = `${siteUrl}/#vallalkozas`
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": businessId,
        name: camper.name,
        description: camper.seo.description,
        url: siteUrl,
        image: `${siteUrl}${camper.hero.image}`,
        telephone: camper.contact.phone,
        email: camper.contact.email,
        priceRange: `${lowestNightlyRate}–${highestNightlyRate} ${camper.pricing.currency} / éj`,
        address: { "@type": "PostalAddress", streetAddress: camper.pickup.address, addressCountry: "HU" },
        geo: { "@type": "GeoCoordinates", latitude: camper.pickup.lat, longitude: camper.pickup.lng },
      },
      {
        "@type": "Product",
        name: `${camper.name} – lakóautó-bérlés`,
        description: camper.shortDescription,
        image: camper.images.map((i) => `${siteUrl}${i.src}`),
        brand: { "@type": "Brand", name: camper.name },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: camper.pricing.currency,
          lowPrice: lowestNightlyRate,
          highPrice: highestNightlyRate,
          offerCount: camper.pricing.seasons.length + 1,
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#foglalas`,
          seller: { "@id": businessId },
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: camper.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
