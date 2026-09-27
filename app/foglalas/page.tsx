import type { Metadata } from "next"

import { BookingProvider } from "@/components/booking/booking-provider"
import { BookingWizard } from "@/components/booking/booking-wizard"
import { PageShell } from "@/components/layout/page-shell"
import { extraIcons } from "@/components/sections/booking-section"
import { camper } from "@/content/camper"
import { isISODate } from "@/lib/dates"

export const metadata: Metadata = {
  title: "Foglalás",
  description: `Foglald le a ${camper.name} lakóautót néhány perc alatt – azonnali visszaigazolással.`,
  robots: { index: false, follow: true },
}

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

export default async function BookingPage({ searchParams }: PageProps<"/foglalas">) {
  const params = await searchParams
  const checkIn = single(params.erkezes)
  const checkOut = single(params.tavozas)
  const extras = (single(params.extrak)?.split(",") ?? []).filter((id) => camper.extras.some((e) => e.id === id))

  return (
    <BookingProvider
      initial={{
        checkIn: isISODate(checkIn) ? checkIn : null,
        checkOut: isISODate(checkIn) && isISODate(checkOut) ? checkOut : null,
        extras,
      }}
    >
      <PageShell>
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-sunset-ink uppercase">Foglalás</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Foglald le a lakóautót</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Négy egyszerű lépés, és már indulhatsz is. A visszaigazolást azonnal megkapod e-mailben.
          </p>
        </header>
        <BookingWizard extraIcons={extraIcons()} />
      </PageShell>
    </BookingProvider>
  )
}
