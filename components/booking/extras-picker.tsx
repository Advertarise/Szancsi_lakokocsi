"use client"

import type { ReactNode } from "react"
import { CheckIcon } from "lucide-react"

import { useBooking } from "@/components/booking/booking-provider"
import { useMoney } from "@/components/shared/money"
import { camper } from "@/content/camper"
import { cn } from "@/lib/utils"

/** Az ikonokat a szerver rendereli és adja át, így a teljes ikonkészlet nem kerül a böngészőbe. */
export function ExtrasPicker({ icons, className }: { icons: Record<string, ReactNode>; className?: string }) {
  const { extras, toggleExtra } = useBooking()
  const { format } = useMoney()

  return (
    <fieldset className={className}>
      <legend className="mb-1 font-heading text-xl font-semibold">Választható extrák</legend>
      <p className="mb-4 text-sm text-muted-foreground">Tedd még kényelmesebbé az utat – bármikor módosíthatod.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {camper.extras.map((extra) => {
          const checked = extras.includes(extra.id)
          return (
            <label
              key={extra.id}
              className={cn(
                "group relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/50",
                "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
                checked ? "border-primary bg-primary/5 shadow-sm" : "border-border",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggleExtra(extra.id)}
                aria-describedby={`extra-${extra.id}-leiras`}
              />
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors [&_svg]:size-5",
                  checked ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                )}
              >
                {icons[extra.id]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{extra.name}</span>
                <span id={`extra-${extra.id}-leiras`} className="mt-0.5 block text-sm text-muted-foreground">
                  {extra.description && <>{extra.description} · </>}
                  <span className="font-medium text-foreground">
                    {format(extra.price)}
                    {extra.unit === "perNight" ? " / éj" : " / bérlés"}
                  </span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {checked && <CheckIcon className="size-3.5" />}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
