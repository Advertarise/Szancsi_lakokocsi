import { camper } from "@/content/camper"
import { formatDate, formatRange, formatWeekday } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import { paymentPlan, type Quote } from "@/lib/pricing"
import type { BookingFormData } from "@/lib/validation"

/**
 * A foglalási kérés a Formspree szolgáltatáson keresztül érkezik e-mailben
 * (formspree.io → új űrlap → az azonosító pl. "xyzabcde"). Ha nincs beállítva,
 * a vendég levelezőprogramja nyílik meg egy kitöltött levéllel.
 */
export const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim() || null

export interface BookingRequest {
  reference: string
  quote: Quote
  form: BookingFormData
}

export type SendResult = "sent" | "mailto"

// Összetéveszthető karakterek (0/O, 1/I) nélkül
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

/** Rövid azonosító, amivel a vendég és te is hivatkozhattok a kérésre. */
export function generateReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `RN-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("")}`
}

export function requestSubject(r: BookingRequest): string {
  return `Foglalási kérés ${r.reference} · ${formatRange(r.quote.checkIn, r.quote.checkOut)} · ${r.form.fullName}`
}

/** A kérés minden adata címke–érték párokban (ez kerül az e-mailbe). */
export function requestRows(r: BookingRequest): [string, string][] {
  const { quote: q, form: f } = r
  const { pickup, pricing } = camper
  const plan = paymentPlan(q, f.paymentOption)
  const priceLines = [
    ...q.nightGroups.map((g) => `${g.nights} éj × ${formatMoney(g.rate)} (${g.label}) = ${formatMoney(g.total)}`),
    `Takarítási díj = ${formatMoney(q.cleaningFee)}`,
    ...q.extras.map((e) =>
      e.unit === "perNight"
        ? `${e.name}: ${e.quantity} éj × ${formatMoney(e.unitPrice)} = ${formatMoney(e.total)}`
        : `${e.name} (egyszeri) = ${formatMoney(e.total)}`,
    ),
  ]

  return [
    ["Foglalási azonosító", r.reference],
    ["Időpont", `${formatRange(q.checkIn, q.checkOut)} (${q.nights} éj)`],
    ["Érkezés", `${formatDate(q.checkIn)}, ${formatWeekday(q.checkIn)} · ${pickup.pickupWindow.from}–${pickup.pickupWindow.to}`],
    ["Távozás", `${formatDate(q.checkOut)}, ${formatWeekday(q.checkOut)} · ${pickup.returnWindow.from}–${pickup.returnWindow.to}`],
    ["Utazók", `${f.guestCount} fő`],
    ["Extrák", q.extras.length ? q.extras.map((e) => e.name).join(", ") : "–"],
    ["Díj részletezése", priceLines.join("\n")],
    ["Bérleti díj összesen", formatMoney(q.total)],
    ["Kaució (átvételkor)", formatMoney(q.securityDeposit)],
    [
      "Választott fizetés",
      plan.option === "deposit" && plan.payLaterDate
        ? `${pricing.depositPercent}% előleg: ${formatMoney(plan.payNow)}, hátralék: ${formatMoney(plan.payLater)} (${formatDate(plan.payLaterDate)}-ig)`
        : `Teljes összeg: ${formatMoney(plan.payNow)}`,
    ],
    ["Név", f.fullName],
    ["E-mail", f.email],
    ["Telefon", f.phone],
    ["Lakcím", `${f.postalCode} ${f.city}, ${f.street}, ${f.country}`],
    ["Születési dátum", formatDate(f.birthDate)],
    [
      "Jogosítvány",
      `${f.licenceNumber} (${f.licenceCountry}), kiállítva: ${formatDate(f.licenceIssuedAt)}, lejár: ${formatDate(f.licenceExpiresAt)}`,
    ],
    ["Megjegyzés", f.notes || "–"],
    ["Feltételek", "Az ÁSZF-et, a lemondási feltételeket és az adatkezelési tájékoztatót elfogadta."],
  ]
}

export function requestText(r: BookingRequest): string {
  return requestRows(r)
    .map(([label, value]) => `${label}: ${value.includes("\n") ? `\n${value}` : value}`)
    .join("\n")
}

export function mailtoHref(r: BookingRequest): string {
  return `mailto:${camper.contact.email}?subject=${encodeURIComponent(requestSubject(r))}&body=${encodeURIComponent(requestText(r))}`
}

/**
 * Kérés elküldése. A `honeypot` egy rejtett mező: ha egy robot kitölti,
 * a Formspree csendben eldobja a beküldést.
 */
export async function sendBookingRequest(r: BookingRequest, honeypot = ""): Promise<SendResult> {
  if (!formspreeId) {
    window.location.href = mailtoHref(r)
    return "mailto"
  }

  const res = await fetch(`https://formspree.io/f/${encodeURIComponent(formspreeId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: requestSubject(r),
      // A Formspree az "email" mezőt használja válaszcímnek, így a levélre közvetlenül a vendégnek válaszolhatsz.
      email: r.form.email,
      _gotcha: honeypot,
      ...Object.fromEntries(requestRows(r)),
    }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { errors?: { message?: string }[] } | null
    throw new Error(data?.errors?.[0]?.message ?? `HTTP ${res.status}`)
  }
  return "sent"
}
