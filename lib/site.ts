/** Az oldal nyilvános címe (canonical URL, OpenGraph, Stripe visszairányítás). */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "")

export const navItems = [
  { href: "/#bemutatkozas", id: "bemutatkozas", label: "Bemutatkozás" },
  { href: "/#galeria", id: "galeria", label: "Galéria" },
  { href: "/#felszereltseg", id: "felszereltseg", label: "Felszereltség" },
  { href: "/#arak", id: "arak", label: "Árak" },
  { href: "/#gyik", id: "gyik", label: "GYIK" },
  { href: "/#kapcsolat", id: "kapcsolat", label: "Kapcsolat" },
] as const

/** Link a foglalási oldalra a kiválasztott dátumokkal és extrákkal. */
export function buildBookingHref(checkIn: string, checkOut: string, extras: string[]) {
  const params = new URLSearchParams({ erkezes: checkIn, tavozas: checkOut })
  if (extras.length) params.set("extrak", extras.join(","))
  return `/foglalas?${params}`
}
