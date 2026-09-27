import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"

import { BookingPageContent } from "@/components/booking/booking-page"
import { PageShell } from "@/components/layout/page-shell"
import { extraIcons } from "@/components/sections/booking-section"
import { camper } from "@/content/camper"

export const metadata: Metadata = {
  title: "Foglalás",
  description: `Küldd el a foglalási kérésedet a ${camper.name} lakóautóra – gyorsan visszaigazoljuk.`,
  robots: { index: false, follow: true },
}

export default function BookingPage() {
  return (
    <PageShell>
      <header className="mb-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-sunset-ink uppercase">Foglalás</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Foglald le a lakóautót</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Négy egyszerű lépés, és már el is küldted a foglalási kérésedet. Most még nem kell fizetned – az időpontot
          e-mailben visszaigazoljuk.
        </p>
      </header>
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center rounded-2xl bg-card text-sm text-muted-foreground">
            <Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Betöltés…
          </div>
        }
      >
        <BookingPageContent extraIcons={extraIcons()} />
      </Suspense>
    </PageShell>
  )
}
