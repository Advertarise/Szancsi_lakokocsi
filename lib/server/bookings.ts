import "server-only"

import { randomBytes, randomInt, timingSafeEqual } from "node:crypto"

import { blockedRangesFromConfig, HOLD_MINUTES, type UnavailableRange } from "@/lib/availability"
import { todayISO } from "@/lib/dates"
import type { ExtraLine, PaymentOption, Quote } from "@/lib/pricing"
import { stripe } from "@/lib/server/stripe"
import { supabase } from "@/lib/server/supabase"

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired"
export type BalanceStatus = "not_required" | "scheduled" | "processing" | "paid" | "failed"

export interface BookingRow {
  id: string
  reference: string
  access_token: string
  status: BookingStatus
  check_in: string
  check_out: string
  nights: number
  expires_at: string | null
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_birth_date: string
  guest_postal_code: string
  guest_city: string
  guest_street: string
  guest_country: string
  guest_count: number
  licence_number: string
  licence_country: string
  licence_issued_at: string
  licence_expires_at: string
  notes: string
  extras: ExtraLine[]
  quote: Quote
  currency: string
  total_amount: number
  security_deposit: number
  payment_option: PaymentOption
  amount_due_now: number
  balance_amount: number
  balance_due_date: string | null
  balance_status: BalanceStatus
  amount_paid: number
  stripe_customer_id: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  stripe_payment_method_id: string | null
  stripe_balance_payment_intent_id: string | null
  terms_accepted_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

export type NewBooking = Omit<
  BookingRow,
  | "id"
  | "reference"
  | "access_token"
  | "status"
  | "nights"
  | "expires_at"
  | "balance_status"
  | "amount_paid"
  | "stripe_customer_id"
  | "stripe_checkout_session_id"
  | "stripe_payment_intent_id"
  | "stripe_payment_method_id"
  | "stripe_balance_payment_intent_id"
  | "confirmed_at"
  | "cancelled_at"
  | "cancellation_reason"
  | "reminder_sent_at"
  | "created_at"
  | "updated_at"
>

export class BookingConflictError extends Error {
  constructor() {
    super("A kiválasztott időszak időközben foglalt lett.")
  }
}

const EXCLUSION_VIOLATION = "23P01"
const UNIQUE_VIOLATION = "23505"

// Összetéveszthető karakterek (0/O, 1/I) nélkül
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

function generateReference(): string {
  let ref = ""
  for (let i = 0; i < 6; i++) ref += REF_ALPHABET[randomInt(REF_ALPHABET.length)]
  return `RN-${ref}`
}

export function tokenMatches(expected: string, given: string | null | undefined): boolean {
  if (!given) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(given)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Lejárt zárolások felszabadítása. A hozzájuk tartozó Stripe fizetési
 * oldalakat is lezárjuk, hogy késve se lehessen rajtuk fizetni.
 */
export async function releaseExpiredHolds(): Promise<number> {
  const { data, error } = await supabase()
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString())
    .select("id, stripe_checkout_session_id")
  if (error) throw error

  await Promise.all(
    (data ?? [])
      .filter((b) => b.stripe_checkout_session_id)
      .map((b) =>
        stripe()
          .checkout.sessions.expire(b.stripe_checkout_session_id as string)
          .catch(() => undefined),
      ),
  )
  return data?.length ?? 0
}

/** Foglalt időszakok (megerősített és még érvényes zárolású foglalások) + blokkolt napok. */
export async function getUnavailableRanges(): Promise<UnavailableRange[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase()
    .from("bookings")
    .select("check_in, check_out")
    .or(`status.eq.confirmed,and(status.eq.pending,expires_at.gt."${now}")`)
    .gte("check_out", todayISO())
  if (error) throw error

  const booked = (data ?? []).map((b) => ({ start: b.check_in as string, end: b.check_out as string }))
  return [...booked, ...blockedRangesFromConfig()]
}

export async function createHold(input: NewBooking): Promise<BookingRow> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase()
      .from("bookings")
      .insert({
        ...input,
        reference: generateReference(),
        access_token: randomBytes(24).toString("base64url"),
        status: "pending",
        expires_at: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
      })
      .select()
      .single()

    if (!error) return data as BookingRow
    if (error.code === EXCLUSION_VIOLATION) throw new BookingConflictError()
    if (error.code === UNIQUE_VIOLATION && error.message.includes("reference")) continue
    throw error
  }
  throw new Error("Nem sikerült egyedi foglalási azonosítót generálni.")
}

export async function updateBooking(id: string, patch: Partial<BookingRow>): Promise<BookingRow> {
  const { data, error } = await supabase().from("bookings").update(patch).eq("id", id).select().single()
  if (error) throw error
  return data as BookingRow
}

/**
 * Feltételes állapotváltás: csak akkor módosít, ha a foglalás a megadott
 * állapotok egyikében van. Így a webhook és a sikeres fizetés oldal
 * párhuzamos futása sem küld kétszer e-mailt. `null`, ha nem történt változás.
 */
export async function transitionBooking(
  id: string,
  from: { status?: BookingStatus[]; balanceStatus?: BalanceStatus[] },
  patch: Partial<BookingRow>,
): Promise<BookingRow | null> {
  let query = supabase().from("bookings").update(patch).eq("id", id)
  if (from.status) query = query.in("status", from.status)
  if (from.balanceStatus) query = query.in("balance_status", from.balanceStatus)
  const { data, error } = await query.select().maybeSingle()
  if (error) {
    if (error.code === EXCLUSION_VIOLATION) throw new BookingConflictError()
    throw error
  }
  return (data as BookingRow | null) ?? null
}

export async function findBookingById(id: string): Promise<BookingRow | null> {
  const { data, error } = await supabase().from("bookings").select().eq("id", id).maybeSingle()
  if (error) throw error
  return (data as BookingRow | null) ?? null
}

export async function findBookingByReference(reference: string, token: string | null): Promise<BookingRow | null> {
  const { data, error } = await supabase().from("bookings").select().eq("reference", reference).maybeSingle()
  if (error) throw error
  const booking = data as BookingRow | null
  return booking && tokenMatches(booking.access_token, token) ? booking : null
}

export async function listBookings(filter: {
  status?: BookingStatus
  balanceStatus?: BalanceStatus
  balanceDueOnOrBefore?: string
  checkInFrom?: string
  checkInTo?: string
  reminderNotSent?: boolean
}): Promise<BookingRow[]> {
  let query = supabase().from("bookings").select()
  if (filter.status) query = query.eq("status", filter.status)
  if (filter.balanceStatus) query = query.eq("balance_status", filter.balanceStatus)
  if (filter.balanceDueOnOrBefore) query = query.lte("balance_due_date", filter.balanceDueOnOrBefore)
  if (filter.checkInFrom) query = query.gte("check_in", filter.checkInFrom)
  if (filter.checkInTo) query = query.lte("check_in", filter.checkInTo)
  if (filter.reminderNotSent) query = query.is("reminder_sent_at", null)
  const { data, error } = await query.order("check_in")
  if (error) throw error
  return (data ?? []) as BookingRow[]
}

/** Az adatvédelmi tájékoztatónak megfelelően a régi, ki nem fizetett foglalások törlése. */
export async function purgeStaleBookings(olderThanDays = 30): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 86_400_000).toISOString()
  const { data, error } = await supabase()
    .from("bookings")
    .delete()
    .eq("status", "expired")
    .lt("created_at", cutoff)
    .select("id")
  if (error) throw error
  return data?.length ?? 0
}
