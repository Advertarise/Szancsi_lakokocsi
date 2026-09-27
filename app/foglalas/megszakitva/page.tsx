import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarXIcon } from "lucide-react"

import { PageShell, StatusCard } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { camper } from "@/content/camper"
import { bookingConfigured } from "@/lib/server/env"
import { buildBookingHref } from "@/lib/site"
import { cancelPendingByGuest } from "@/lib/server/payments"

export const metadata: Metadata = {
  title: "Megszakított fizetés",
  robots: { index: false, follow: false },
}

/** Ide érkezik a vendég, ha a Stripe fizetési oldalon a „Vissza” gombot választja. */
export default async function CancelledPage({ searchParams }: PageProps<"/foglalas/megszakitva">) {
  const { ref, t } = await searchParams
  let retryHref = "/#foglalas"

  if (typeof ref === "string" && bookingConfigured()) {
    const result = await cancelPendingByGuest(ref, typeof t === "string" ? t : null).catch((error) => {
      console.error("[megszakitva]", error)
      return null
    })
    if (result && "booking" in result && result.booking) {
      const b = result.booking
      // Közben mégis sikerült a fizetés → a sikeres oldalra irányítunk.
      if ((result.state === "paid" || result.state === "confirmed") && b.stripe_checkout_session_id) {
        redirect(`/foglalas/sikeres?session_id=${b.stripe_checkout_session_id}`)
      }
      retryHref = buildBookingHref(b.check_in, b.check_out, b.extras.map((e) => e.id))
    }
  }

  return (
    <PageShell>
      <StatusCard icon={<CalendarXIcon />} title="A fizetés megszakadt">
        <p>
          Nem történt terhelés, és a kiválasztott dátumokat felszabadítottuk. A megadott adataidat ezen a böngészőfülön
          megőriztük, így bármikor folytathatod a foglalást.
        </p>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Button asChild variant="sunset" size="xl">
            <Link href={retryHref}>Foglalás folytatása</Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </div>
        <p className="text-sm">
          Kérdésed van? {camper.contact.phone} · {camper.contact.email}
        </p>
      </StatusCard>
    </PageShell>
  )
}
