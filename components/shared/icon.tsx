import "server-only"

import { icons, type LucideProps } from "lucide-react"

import type { IconName } from "@/lib/camper-types"

/**
 * Lucide ikon név alapján. Csak szerverkomponensben használható, így a
 * teljes ikonkészlet nem kerül a böngészőbe küldött JavaScriptbe.
 */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name]
  return <Component aria-hidden="true" {...props} />
}
