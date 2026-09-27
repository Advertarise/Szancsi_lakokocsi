/** Almappa, ahonnan az oldalt kiszolgálják (GitHub Pages projektoldalnál pl. "/Szancsi_lakokocsi"). */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

/** Az oldal teljes nyilvános címe az almappával együtt (canonical URL, OpenGraph, sitemap). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000${basePath}`).replace(/\/$/, "")

/**
 * A public mappában lévő fájl elérési útja. A next/image és a sima <img> nem
 * fűzi hozzá magától az almappát, ezért a képeknél ezt kell használni.
 */
export function asset(path: string): string {
  return path.startsWith("/") ? `${basePath}${path}` : path
}

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
  return `/foglalas/?${params}`
}
