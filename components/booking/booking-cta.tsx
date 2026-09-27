"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { useBooking } from "@/components/booking/booking-provider"
import { useMoney } from "@/components/shared/money"
import { Button } from "@/components/ui/button"
import { lowestNightlyRate } from "@/lib/pricing"

export function BookingCta() {
  const { bookingHref } = useBooking()
  return (
    <>
      {bookingHref ? (
        <Button asChild variant="sunset" size="xl" className="w-full">
          <Link href={bookingHref}>
            Tovább a foglaláshoz
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      ) : (
        <Button variant="sunset" size="xl" className="w-full" disabled>
          Válassz dátumokat
        </Button>
      )}
      <p className="mt-2 text-center text-xs text-muted-foreground">Ezen a ponton még nem kell fizetned.</p>
    </>
  )
}

/** Mobilon alul fix sáv: ár + foglalás gomb. */
export function MobileBookingBar() {
  const { quote, bookingHref } = useBooking()
  const { format } = useMoney()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <p className="min-w-0 leading-tight">
          {quote ? (
            <>
              <span className="block font-heading text-lg font-semibold">{format(quote.total)}</span>
              <span className="text-xs text-muted-foreground">{quote.nights} éj, takarítással</span>
            </>
          ) : (
            <>
              <span className="font-heading text-lg font-semibold">{format(lowestNightlyRate)}</span>
              <span className="text-sm text-muted-foreground">-tól / éj</span>
            </>
          )}
        </p>
        <Button asChild variant="sunset" size="xl" className="shrink-0">
          {bookingHref ? (
            <Link href={bookingHref}>
              Tovább
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          ) : (
            <Link href="/#foglalas">Foglalás</Link>
          )}
        </Button>
      </div>
    </div>
  )
}
