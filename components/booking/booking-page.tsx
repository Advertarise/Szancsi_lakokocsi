"use client"

import type { ReactNode } from "react"
import { useSearchParams } from "next/navigation"

import { BookingProvider } from "@/components/booking/booking-provider"
import { BookingWizard } from "@/components/booking/booking-wizard"
import { camper } from "@/content/camper"
import { isISODate } from "@/lib/dates"

/** A főoldalon kiválasztott dátumokat és extrákat az URL-ből veszi át (?erkezes=…&tavozas=…&extrak=…). */
export function BookingPageContent({ extraIcons }: { extraIcons: Record<string, ReactNode> }) {
  const params = useSearchParams()
  const checkIn = params.get("erkezes")
  const checkOut = params.get("tavozas")
  const extras = (params.get("extrak")?.split(",") ?? []).filter((id) => camper.extras.some((e) => e.id === id))
  const validCheckIn = isISODate(checkIn) ? checkIn : null

  return (
    <BookingProvider
      initial={{
        checkIn: validCheckIn,
        checkOut: validCheckIn && isISODate(checkOut) ? checkOut : null,
        extras,
      }}
    >
      <BookingWizard extraIcons={extraIcons} />
    </BookingProvider>
  )
}
