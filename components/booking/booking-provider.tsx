"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import { blockedRangesFromConfig, buildUnavailableNights, validateStay } from "@/lib/availability"
import { todayISO } from "@/lib/dates"
import { quote, type Quote } from "@/lib/pricing"
import { buildBookingHref } from "@/lib/site"

interface BookingContextValue {
  today: string
  checkIn: string | null
  checkOut: string | null
  extras: string[]
  setDates: (checkIn: string | null, checkOut: string | null) => void
  toggleExtra: (id: string) => void
  clear: () => void
  /** Nem foglalható éjszakák (a content/camper.ts blokkolt napjai) */
  unavailable: Set<string>
  /** Hibaüzenet, ha a kiválasztott időszak nem foglalható */
  stayError: string | null
  /** Árajánlat, ha érvényes időszak van kiválasztva */
  quote: Quote | null
  /** Link a foglalási oldalra a kiválasztott adatokkal */
  bookingHref: string | null
}

const BookingContext = createContext<BookingContextValue | null>(null)

// A foglaltság a content/camper.ts blokkolt napjaiból jön – statikus oldalon nincs adatbázis.
const unavailable = buildUnavailableNights(blockedRangesFromConfig())

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBooking csak BookingProvider-en belül használható.")
  return ctx
}

export function BookingProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: { checkIn?: string | null; checkOut?: string | null; extras?: string[] }
}) {
  const [today] = useState(() => todayISO())
  const [checkIn, setCheckIn] = useState<string | null>(initial?.checkIn ?? null)
  const [checkOut, setCheckOut] = useState<string | null>(initial?.checkOut ?? null)
  const [extras, setExtras] = useState<string[]>(initial?.extras ?? [])

  const setDates = useCallback((ci: string | null, co: string | null) => {
    setCheckIn(ci)
    setCheckOut(co)
  }, [])

  const toggleExtra = useCallback((id: string) => {
    setExtras((current) => (current.includes(id) ? current.filter((e) => e !== id) : [...current, id]))
  }, [])

  const clear = useCallback(() => {
    setCheckIn(null)
    setCheckOut(null)
  }, [])

  const value = useMemo<BookingContextValue>(() => {
    const stayError = checkIn && checkOut ? validateStay({ checkIn, checkOut, unavailable, today }) : null
    const q = checkIn && checkOut && !stayError ? quote({ checkIn, checkOut, extras, today }) : null
    return {
      today,
      checkIn,
      checkOut,
      extras,
      setDates,
      toggleExtra,
      clear,
      unavailable,
      stayError,
      quote: q,
      bookingHref: q ? buildBookingHref(q.checkIn, q.checkOut, extras) : null,
    }
  }, [today, checkIn, checkOut, extras, setDates, toggleExtra, clear])

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
