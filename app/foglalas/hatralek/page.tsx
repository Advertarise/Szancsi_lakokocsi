import type { Metadata } from "next"
import Link from "next/link"
import { CheckIcon, HourglassIcon, TriangleAlertIcon } from "lucide-react"

import { PageShell, StatusCard } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { camper } from "@/content/camper"

export const metadata: Metadata = {
  title: "Fennmaradó összeg",
  robots: { index: false, follow: false },
}

const contact = `${camper.contact.phone} · ${camper.contact.email}`

const states = {
  rendezve: {
    icon: <CheckIcon />,
    tone: "success" as const,
    title: "Nincs teendőd",
    text: "Ennek a foglalásnak a teljes összege már rendezve van. Köszönjük!",
  },
  folyamatban: {
    icon: <HourglassIcon />,
    tone: "neutral" as const,
    title: "A levonás ütemezve van",
    text: "A fennmaradó összeget a megadott napon automatikusan levonjuk a kártyádról, most nincs teendőd.",
  },
  hiba: {
    icon: <TriangleAlertIcon />,
    tone: "warning" as const,
    title: "Nem sikerült megnyitni a fizetési oldalt",
    text: `Kérjük, próbáld újra pár perc múlva, vagy keress minket: ${contact}`,
  },
  ismeretlen: {
    icon: <TriangleAlertIcon />,
    tone: "warning" as const,
    title: "Nem található foglalás",
    text: `A link érvénytelen vagy lejárt. Ha segítség kell, keress minket: ${contact}`,
  },
}

export default async function BalanceStatusPage({ searchParams }: PageProps<"/foglalas/hatralek">) {
  const { allapot } = await searchParams
  const state = states[(typeof allapot === "string" && allapot in states ? allapot : "ismeretlen") as keyof typeof states]

  return (
    <PageShell>
      <StatusCard icon={state.icon} tone={state.tone} title={state.title}>
        <p>{state.text}</p>
        <Button asChild size="lg">
          <Link href="/">Vissza a főoldalra</Link>
        </Button>
      </StatusCard>
    </PageShell>
  )
}
