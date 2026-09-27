import type { Metadata } from "next"
import Link from "next/link"
import {
  CalendarPlusIcon,
  CheckIcon,
  ClockIcon,
  HourglassIcon,
  NavigationIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { ClearBookingDraft } from "@/components/booking/clear-draft"
import { PageShell, StatusCard } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { camper } from "@/content/camper"
import { HOLD_MINUTES } from "@/lib/availability"
import { formatDate, formatRange, formatWeekday } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import type { BookingRow } from "@/lib/server/bookings"
import { bookingConfigured } from "@/lib/server/env"
import { fulfillCheckoutSession, type FulfillResult } from "@/lib/server/payments"

export const metadata: Metadata = {
  title: "Sikeres foglalás",
  robots: { index: false, follow: false },
}

const contactLine = `${camper.contact.phone} · ${camper.contact.email}`

export default async function SuccessPage({ searchParams }: PageProps<"/foglalas/sikeres">) {
  const { session_id: sessionId } = await searchParams
  let result: FulfillResult | { state: "error" } = { state: "not_found" }

  if (typeof sessionId === "string" && sessionId.startsWith("cs_") && bookingConfigured()) {
    try {
      // A webhook mellett itt is feldolgozzuk a fizetést, így a vendég azonnal a végleges állapotot látja.
      result = await fulfillCheckoutSession(sessionId)
    } catch (error) {
      console.error("[sikeres]", error)
      result = { state: "error" }
    }
  }

  return (
    <PageShell>
      {result.state === "confirmed" && <Confirmed booking={result.booking} />}

      {result.state === "balance_paid" && (
        <StatusCard icon={<CheckIcon />} tone="success" title="Sikeres fizetés!">
          <p>
            A(z) <strong className="text-foreground">{result.booking.reference}</strong> foglalás fennmaradó összegét
            megkaptuk, a bérleti díj teljes egészében rendezve van. Visszaigazolást e-mailben is küldtünk.
          </p>
          <Button asChild size="lg">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </StatusCard>
      )}

      {result.state === "processing" && (
        <StatusCard icon={<HourglassIcon />} title="A fizetés feldolgozás alatt">
          <p>
            A bankod még dolgozik a tranzakción. Amint megerősítést kapunk, e-mailben elküldjük a visszaigazolást – ez
            általában csak néhány perc.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href={`/foglalas/sikeres?session_id=${sessionId}`}>
              <RefreshCwIcon data-icon="inline-start" />
              Állapot frissítése
            </Link>
          </Button>
        </StatusCard>
      )}

      {result.state === "conflict" && (
        <StatusCard icon={<TriangleAlertIcon />} tone="warning" title="Sajnos elkelt az időpont">
          <p>
            A fizetés a {HOLD_MINUTES} perces zárolási idő lejárta után érkezett, és közben
            valaki más lefoglalta ezt az időszakot. A teljes összeget automatikusan visszatérítettük; néhány munkanapon
            belül megjelenik a számládon.
          </p>
          <p>Nagyon sajnáljuk! Válassz egy másik időpontot, vagy keress minket: {contactLine}</p>
          <Button asChild variant="sunset" size="lg">
            <Link href="/#foglalas">Másik időpont választása</Link>
          </Button>
        </StatusCard>
      )}

      {(result.state === "not_found" || result.state === "cancelled" || result.state === "error") && (
        <StatusCard icon={<TriangleAlertIcon />} tone="warning" title="Nem találjuk ezt a foglalást">
          <p>
            Ha fizettél, ne aggódj: a visszaigazolást e-mailben is megkapod. Ha néhány percen belül nem érkezik meg,
            keress minket: {contactLine}
          </p>
          <Button asChild size="lg">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </StatusCard>
      )}
    </PageShell>
  )
}

function Confirmed({ booking: b }: { booking: BookingRow }) {
  const { pickup } = camper
  const icsHref = `/api/ics?ref=${encodeURIComponent(b.reference)}&t=${encodeURIComponent(b.access_token)}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pickup.lat},${pickup.lng}`
  const balanceDue = b.balance_amount > 0 && b.balance_status !== "paid" && b.balance_status !== "not_required"

  const rows: [string, string][] = [
    ["Időpont", `${formatRange(b.check_in, b.check_out)} · ${b.nights} éj`],
    ["Átvétel", `${formatDate(b.check_in)}, ${formatWeekday(b.check_in)} · ${pickup.pickupWindow.from}–${pickup.pickupWindow.to}`],
    ["Visszaadás", `${formatDate(b.check_out)}, ${formatWeekday(b.check_out)} · ${pickup.returnWindow.from}–${pickup.returnWindow.to}`],
    ["Helyszín", pickup.address],
    ["Utazók", `${b.guest_count} fő`],
    ["Extrák", b.extras.length ? b.extras.map((e) => e.name).join(", ") : "–"],
    ["Bérleti díj", formatMoney(b.total_amount)],
    ["Kifizetve", formatMoney(b.amount_paid)],
    ...(balanceDue && b.balance_due_date
      ? ([["Hátralék", `${formatMoney(b.balance_amount)} – automatikus levonás ${formatDate(b.balance_due_date)}`]] as [string, string][])
      : []),
    [
      "Kaució",
      `${formatMoney(b.security_deposit)} (${camper.pricing.securityDeposit.collect === "atPickup" ? "átvételkor fizetendő" : "online fizetve"})`,
    ],
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <ClearBookingDraft />
      <div className="text-center">
        <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-4xl font-semibold text-balance sm:text-5xl">Köszönjük, a foglalásod megerősítve!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A visszaigazolást elküldtük ide: <strong className="text-foreground">{b.guest_email}</strong>
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl shadow-black/5">
        <div className="flex flex-col items-center gap-1 bg-primary px-6 py-6 text-primary-foreground">
          <p className="text-sm tracking-widest uppercase opacity-85">Foglalási azonosító</p>
          <p className="font-heading text-4xl font-semibold tracking-wider select-all">{b.reference}</p>
        </div>
        <dl className="divide-y divide-border/70 px-6 sm:px-8">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 border-t bg-muted/60 p-6 sm:flex-row sm:justify-center sm:px-8">
          <Button asChild variant="sunset" size="xl">
            <a href={icsHref} download={`${b.reference}.ics`}>
              <CalendarPlusIcon data-icon="inline-start" />
              Hozzáadás a naptárhoz
            </a>
          </Button>
          <Button asChild variant="outline" size="xl">
            <a href={directionsUrl} target="_blank" rel="noopener">
              <NavigationIcon data-icon="inline-start" />
              Útvonaltervezés
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card p-6">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
            <ClockIcon className="size-4 text-sunset-ink" aria-hidden="true" /> Mit hozz magaddal?
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Jogosítvány és személyi igazolvány vagy útlevél</li>
            {camper.pricing.securityDeposit.collect === "atPickup" && (
              <li>Kaució: {formatMoney(camper.pricing.securityDeposit.amount)} (készpénz vagy átutalás)</li>
            )}
            <li>Jókedv – minden mást mi biztosítunk</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6">
          <h2 className="font-sans text-base font-semibold">Kérdésed van?</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {camper.contact.ownerName} szívesen segít: {contactLine}.
            {balanceDue && " A hátralék levonásához nem kell semmit tenned."}
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  )
}
