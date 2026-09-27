import { camper } from "@/content/camper"
import type { Extra, Season } from "@/lib/camper-types"
import { addDaysISO, eachNight, isWithinMonthDayRange, nightsBetween } from "@/lib/dates"

const { pricing } = camper

export type PaymentOption = "full" | "deposit"

export function seasonFor(isoDate: string): Season | undefined {
  // Átfedés esetén a listában előbb szereplő szezon érvényes.
  return pricing.seasons.find((s) => isWithinMonthDayRange(isoDate, s.from, s.to))
}

export function nightlyRate(isoDate: string): number {
  return seasonFor(isoDate)?.nightlyPrice ?? pricing.baseNightlyPrice
}

/** A minimum éjszakák számát az érkezés napjának szezonja határozza meg. */
export function minNightsFor(checkIn: string): number {
  return seasonFor(checkIn)?.minNights ?? pricing.minNights
}

export const lowestNightlyRate = Math.min(pricing.baseNightlyPrice, ...pricing.seasons.map((s) => s.nightlyPrice))
export const highestNightlyRate = Math.max(pricing.baseNightlyPrice, ...pricing.seasons.map((s) => s.nightlyPrice))

export interface NightGroup {
  label: string
  nights: number
  rate: number
  total: number
}

export interface ExtraLine {
  id: string
  name: string
  unit: Extra["unit"]
  unitPrice: number
  quantity: number
  total: number
}

export interface Quote {
  checkIn: string
  checkOut: string
  nights: number
  nightGroups: NightGroup[]
  accommodationTotal: number
  cleaningFee: number
  extras: ExtraLine[]
  extrasTotal: number
  /** A bérlés teljes díja (kaució nélkül) */
  total: number
  /** Átvételkor fizetendő, visszajár */
  securityDeposit: number
  /** Van-e lehetőség előleges fizetésre ennél a foglalásnál */
  depositAvailable: boolean
  depositAmount: number
  balanceAmount: number
  balanceDueDate: string | null
}

export interface PaymentPlan {
  option: PaymentOption
  /** A visszaigazolás után elsőként fizetendő összeg (előleg vagy a teljes díj) */
  payNow: number
  /** A hátralék, ha előleget választott */
  payLater: number
  /** A hátralék határideje */
  payLaterDate: string | null
}

export function balanceDueDateFor(checkIn: string): string {
  return addDaysISO(checkIn, -pricing.balanceDueDaysBefore)
}

/** Előleg csak akkor választható, ha a hátralék határidejéig még legalább 2 nap van. */
export function isDepositAvailable(checkIn: string, today: string): boolean {
  if (pricing.depositPercent <= 0 || pricing.depositPercent >= 100) return false
  return nightsBetween(today, balanceDueDateFor(checkIn)) >= 2
}

export function quote(input: { checkIn: string; checkOut: string; extras: string[]; today: string }): Quote {
  const { checkIn, checkOut, today } = input
  const nightDates = eachNight(checkIn, checkOut)

  const groups = new Map<string, NightGroup>()
  for (const date of nightDates) {
    const season = seasonFor(date)
    const rate = season?.nightlyPrice ?? pricing.baseNightlyPrice
    const key = `${season?.id ?? "base"}-${rate}`
    const group = groups.get(key) ?? { label: season?.name ?? "Alapár", nights: 0, rate, total: 0 }
    group.nights++
    group.total += rate
    groups.set(key, group)
  }
  const nightGroups = [...groups.values()]
  const accommodationTotal = nightGroups.reduce((sum, g) => sum + g.total, 0)

  const selected = new Set(input.extras)
  const extras: ExtraLine[] = camper.extras
    .filter((e) => selected.has(e.id))
    .map((e) => {
      const quantity = e.unit === "perNight" ? nightDates.length : 1
      return { id: e.id, name: e.name, unit: e.unit, unitPrice: e.price, quantity, total: e.price * quantity }
    })
  const extrasTotal = extras.reduce((sum, e) => sum + e.total, 0)

  const total = accommodationTotal + pricing.cleaningFee + extrasTotal
  const depositAvailable = isDepositAvailable(checkIn, today)
  const depositAmount = Math.round((total * pricing.depositPercent) / 100)

  return {
    checkIn,
    checkOut,
    nights: nightDates.length,
    nightGroups,
    accommodationTotal,
    cleaningFee: pricing.cleaningFee,
    extras,
    extrasTotal,
    total,
    securityDeposit: pricing.securityDeposit.amount,
    depositAvailable,
    depositAmount,
    balanceAmount: total - depositAmount,
    balanceDueDate: depositAvailable ? balanceDueDateFor(checkIn) : null,
  }
}

/** Mennyit kell a visszaigazolás után és mennyit később fizetni (a kaució nélkül). */
export function paymentPlan(q: Quote, option: PaymentOption): PaymentPlan {
  if (option === "deposit" && q.depositAvailable) {
    return { option, payNow: q.depositAmount, payLater: q.balanceAmount, payLaterDate: q.balanceDueDate }
  }
  return { option: "full", payNow: q.total, payLater: 0, payLaterDate: null }
}
