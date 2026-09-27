import { addDays, differenceInCalendarDays, format, isValid, parse } from "date-fns"
import { hu } from "date-fns/locale"

/**
 * Minden foglalási dátumot "ÉÉÉÉ-HH-NN" szövegként kezelünk, így a böngésző
 * és a szerver időzónája nem tud elcsúszást okozni. Számoláshoz helyi éjfélre
 * alakítjuk őket.
 */
export const TIME_ZONE = "Europe/Budapest"

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export function isISODate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_RE.test(value)) return false
  return isValid(parse(value, "yyyy-MM-dd", new Date()))
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function addDaysISO(value: string, days: number): string {
  return toISODate(addDays(parseISODate(value), days))
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(parseISODate(checkOut), parseISODate(checkIn))
}

/** Az adott nap, magyar idő szerint. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** Az érkezéstől a távozás előtti napig minden éjszaka dátuma. */
export function eachNight(checkIn: string, checkOut: string): string[] {
  const nights: string[] = []
  for (let d = checkIn; d < checkOut; d = addDaysISO(d, 1)) nights.push(d)
  return nights
}

/** Teljes évek száma két dátum között (pl. életkor). */
export function yearsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number)
  const [ty, tm, td] = to.split("-").map(Number)
  let years = ty - fy
  if (tm < fm || (tm === fm && td < fd)) years--
  return years
}

export function formatDate(value: string, pattern = "yyyy. MMMM d."): string {
  return format(parseISODate(value), pattern, { locale: hu })
}

export function formatDateShort(value: string): string {
  return format(parseISODate(value), "MMM d.", { locale: hu })
}

export function formatWeekday(value: string): string {
  return format(parseISODate(value), "EEEE", { locale: hu })
}

/** pl. "2026. júl. 1. – júl. 8." vagy évváltásnál "2026. dec. 28. – 2027. jan. 3." */
export function formatRange(checkIn: string, checkOut: string): string {
  const a = parseISODate(checkIn)
  const b = parseISODate(checkOut)
  const sameYear = a.getFullYear() === b.getFullYear()
  return `${format(a, "yyyy. MMM d.", { locale: hu })} – ${format(b, sameYear ? "MMM d." : "yyyy. MMM d.", { locale: hu })}`
}

/** "HH-NN" évente ismétlődő napot hasonlít össze egy dátummal (évfordulón átnyúló tartományt is kezel). */
export function isWithinMonthDayRange(isoDate: string, from: string, to: string): boolean {
  const md = isoDate.slice(5)
  return from <= to ? md >= from && md <= to : md >= from || md <= to
}

/** "12-20" → "dec. 20." */
export function formatMonthDay(md: string): string {
  const [m, d] = md.split("-").map(Number)
  return format(new Date(2000, m - 1, d), "MMM d.", { locale: hu })
}
