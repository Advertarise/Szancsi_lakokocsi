import { addMonths } from "date-fns"

import { camper } from "@/content/camper"
import { addDaysISO, eachNight, formatDate, isISODate, nightsBetween, parseISODate, toISODate } from "@/lib/dates"
import { minNightsFor } from "@/lib/pricing"

/** Ennyi percig zároljuk a dátumokat a fizetés befejezéséig. */
export const HOLD_MINUTES = 15

/**
 * Nem foglalható időszak éjszakákban: `start` az első foglalt éjszaka,
 * `end` az első újra szabad éjszaka (kizárólagos vég). Így a foglalások
 * [érkezés, távozás) tartományai közvetlenül használhatók, és a távozás
 * napján már érkezhet a következő vendég.
 */
export interface UnavailableRange {
  start: string
  end: string
}

export function blockedRangesFromConfig(): UnavailableRange[] {
  return camper.blockedDates.map((b) => ({ start: b.from, end: addDaysISO(b.to, 1) }))
}

export function buildUnavailableNights(ranges: UnavailableRange[]): Set<string> {
  const nights = new Set<string>()
  for (const r of ranges) for (const night of eachNight(r.start, r.end)) nights.add(night)
  return nights
}

export function bookingWindow(today: string) {
  return {
    earliestCheckIn: addDaysISO(today, camper.booking.minDaysBeforeCheckIn),
    latestCheckOut: toISODate(addMonths(parseISODate(today), camper.booking.maxMonthsAhead)),
  }
}

/** Az érkezés utáni első foglalt éjszaka – ez a nap még választható távozásnak. */
export function firstUnavailableNightAfter(checkIn: string, unavailable: Set<string>): string | null {
  const limit = camper.pricing.maxNights + 1
  for (let i = 1; i <= limit; i++) {
    const night = addDaysISO(checkIn, i)
    if (unavailable.has(night)) return night
  }
  return null
}

/** Érkezésnek csak olyan nap választható, amely után a minimum éjszakák száma is szabad. */
export function canCheckIn(date: string, unavailable: Set<string>, today: string): boolean {
  const { earliestCheckIn, latestCheckOut } = bookingWindow(today)
  if (date < earliestCheckIn || date >= latestCheckOut || unavailable.has(date)) return false
  const minNights = minNightsFor(date)
  for (let i = 1; i < minNights; i++) if (unavailable.has(addDaysISO(date, i))) return false
  return addDaysISO(date, minNights) <= latestCheckOut
}

export function canCheckOut(checkIn: string, date: string, unavailable: Set<string>, today: string): boolean {
  if (date <= checkIn) return false
  const nights = nightsBetween(checkIn, date)
  if (nights < minNightsFor(checkIn) || nights > camper.pricing.maxNights) return false
  if (date > bookingWindow(today).latestCheckOut) return false
  const firstBlocked = firstUnavailableNightAfter(checkIn, unavailable)
  return firstBlocked === null || date <= firstBlocked
}

/** Hibaüzenet magyarul, vagy null, ha az időszak foglalható. */
export function validateStay(input: {
  checkIn: string
  checkOut: string
  unavailable: Set<string>
  today: string
}): string | null {
  const { checkIn, checkOut, unavailable, today } = input
  if (!isISODate(checkIn) || !isISODate(checkOut)) return "Válaszd ki az érkezés és a távozás napját."
  if (checkOut <= checkIn) return "A távozás napja az érkezés utáni nap vagy későbbi legyen."

  const { earliestCheckIn, latestCheckOut } = bookingWindow(today)
  if (checkIn < earliestCheckIn) return `Legkorábban ${formatDate(earliestCheckIn)} napra lehet érkezést foglalni.`
  if (checkOut > latestCheckOut) return `Legfeljebb ${camper.booking.maxMonthsAhead} hónapra előre lehet foglalni.`

  const nights = nightsBetween(checkIn, checkOut)
  const minNights = minNightsFor(checkIn)
  if (nights < minNights) return `Ebben az időszakban legalább ${minNights} éjszakára lehet foglalni.`
  if (nights > camper.pricing.maxNights) return `Legfeljebb ${camper.pricing.maxNights} éjszakára lehet foglalni.`

  if (eachNight(checkIn, checkOut).some((n) => unavailable.has(n)))
    return "A kiválasztott időszak egy része már foglalt. Kérjük, válassz másik időpontot."

  return null
}
