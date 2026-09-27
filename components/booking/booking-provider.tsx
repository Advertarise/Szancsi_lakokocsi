"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import {
  blockedRangesFromConfig,
  buildUnavailableNights,
  validateStay,
  type UnavailableRange,
} from "@/lib/availability"
import { todayISO } from "@/lib/dates"
import { quote, type Quote } from "@/lib/pricing"
import { buildBookingHref } from "@/lib/site"

type AvailabilityStatus = "loading" | "ready" | "error"

interface BookingContextValue {
  today: string
  checkIn: string | null
  checkOut: string | null
  extras: string[]
  setDates: (checkIn: string | null, checkOut: string | null) => void
  toggleExtra: (id: string) => void
  clear: () => void
  unavailable: Set<string>
  availabilityStatus: AvailabilityStatus
  refreshAvailability: () => void
  /** Hibaüzenet, ha a kiválasztott időszak nem foglalható */
  stayError: string | null
  /** Árajánlat, ha érvényes időszak van kiválasztva */
  quote: Quote | null
  /** Link a foglalási oldalra a kiválasztott adatokkal */
  bookingHref: string | null
}

const BookingContext = createContext<BookingContextValue | null>(null)

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
  const [availability, setAvailability] = useState<{ status: AvailabilityStatus; ranges: UnavailableRange[] }>({
    status: "loading",
    ranges: blockedRangesFromConfig(),
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/availability", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { ranges: UnavailableRange[] }) => setAvailability({ status: "ready", ranges: data.ranges }))
      .catch(() => {
        if (!controller.signal.aborted) setAvailability((a) => ({ ...a, status: "error" }))
      })
    return () => controller.abort()
  }, [reloadKey])

  const refreshAvailability = useCallback(() => {
    setAvailability((a) => ({ ...a, status: "loading" }))
    setReloadKey((k) => k + 1)
  }, [])

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

  const unavailable = useMemo(() => buildUnavailableNights(availability.ranges), [availability.ranges])

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
      availabilityStatus: availability.status,
      refreshAvailability,
      stayError,
      quote: q,
      bookingHref: q ? buildBookingHref(q.checkIn, q.checkOut, extras) : null,
    }
  }, [today, checkIn, checkOut, extras, setDates, toggleExtra, clear, unavailable, availability.status, refreshAvailability])

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
