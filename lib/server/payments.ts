import "server-only"

import Stripe from "stripe"

import { camper } from "@/content/camper"
import { addDaysISO, formatDate, formatRange, nightsBetween, todayISO } from "@/lib/dates"
import { formatMoney, fromStripeAmount, toStripeAmount } from "@/lib/money"
import {
  BookingConflictError,
  findBookingById,
  findBookingByReference,
  listBookings,
  transitionBooking,
  updateBooking,
  type BookingRow,
} from "@/lib/server/bookings"
import { env } from "@/lib/server/env"
import {
  notifyBalanceFailed,
  notifyBalancePaid,
  notifyBookingConfirmed,
  notifyConflict,
  notifyReminder,
} from "@/lib/server/notifications"
import { idOf, stripe } from "@/lib/server/stripe"

const currency = camper.pricing.currency.toLowerCase()

type Kind = "booking" | "balance"

function metadata(b: BookingRow, kind: Kind) {
  return { booking_id: b.id, reference: b.reference, kind }
}

function productImages(): string[] | undefined {
  // A Stripe csak nyilvánosan elérhető (https) képet tud megjeleníteni.
  return env.siteUrl.startsWith("https://") ? [`${env.siteUrl}${camper.hero.image}`] : undefined
}

/** Stripe Checkout indítása egy frissen zárolt foglaláshoz. Visszaadja a fizetési oldal URL-jét. */
export async function startCheckout(b: BookingRow): Promise<string> {
  const s = stripe()
  const isDeposit = b.payment_option === "deposit"

  const customer = await s.customers.create({
    name: b.guest_name,
    email: b.guest_email,
    phone: b.guest_phone,
    metadata: { booking_reference: b.reference },
  })

  const submitMessage = isDeposit
    ? `Most ${formatMoney(b.amount_due_now)} előleget fizetsz. A fennmaradó ${formatMoney(b.balance_amount)} összeget ${formatDate(b.balance_due_date as string)} napon automatikusan levonjuk erről a kártyáról.`
    : `A dátumokat ${formatRange(b.check_in, b.check_out)} időszakra zároltuk a fizetés idejére.`

  const session = await s.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
    client_reference_id: b.id,
    payment_method_types: ["card"], // bankkártya + Apple Pay + Google Pay
    locale: "hu",
    // A Stripe legalább 30 perces lejáratot enged; a dátumokat mi 15 percre zároljuk.
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: toStripeAmount(b.amount_due_now),
          product_data: {
            name: isDeposit
              ? `${camper.name} lakóautó-bérlés – ${camper.pricing.depositPercent}% előleg`
              : `${camper.name} lakóautó-bérlés`,
            description: `${formatRange(b.check_in, b.check_out)} · ${b.nights} éj · ${b.reference}`,
            images: productImages(),
          },
        },
      },
    ],
    payment_intent_data: {
      description: `${camper.name} foglalás ${b.reference}`,
      metadata: metadata(b, "booking"),
      // Előlegnél elmentjük a kártyát a későbbi automatikus levonáshoz.
      ...(isDeposit ? { setup_future_usage: "off_session" as const } : {}),
    },
    metadata: metadata(b, "booking"),
    custom_text: { submit: { message: submitMessage } },
    success_url: `${env.siteUrl}/foglalas/sikeres?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.siteUrl}/foglalas/megszakitva?ref=${encodeURIComponent(b.reference)}&t=${encodeURIComponent(b.access_token)}`,
  })

  await updateBooking(b.id, { stripe_checkout_session_id: session.id, stripe_customer_id: customer.id })
  if (!session.url) throw new Error("A Stripe nem adott vissza fizetési URL-t.")
  return session.url
}

export type FulfillResult =
  | { state: "confirmed" | "balance_paid" | "conflict" | "cancelled"; booking: BookingRow }
  | { state: "processing"; booking: BookingRow }
  | { state: "not_found" }

/**
 * Sikeres fizetés feldolgozása. A webhook és a „sikeres foglalás” oldal is
 * meghívja; a feltételes állapotváltás miatt többszöri hívás sem okoz gondot.
 */
export async function fulfillCheckoutSession(input: string | Stripe.Checkout.Session): Promise<FulfillResult> {
  const session =
    typeof input === "string" ? await stripe().checkout.sessions.retrieve(input, { expand: ["payment_intent"] }) : input
  const bookingId = session.metadata?.booking_id
  const booking = bookingId ? await findBookingById(bookingId) : null
  if (!booking) return { state: "not_found" }

  if (session.payment_status !== "paid") return { state: "processing", booking }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? await stripe().paymentIntents.retrieve(session.payment_intent)
      : session.payment_intent
  if (!paymentIntent) return { state: "processing", booking }

  if (session.metadata?.kind === "balance") {
    const updated = await markBalancePaid(booking, paymentIntent.id)
    return { state: "balance_paid", booking: updated ?? booking }
  }

  if (booking.status === "confirmed") return { state: "confirmed", booking }
  if (booking.status === "cancelled") {
    return { state: booking.cancellation_reason === "conflict" ? "conflict" : "cancelled", booking }
  }

  const now = new Date().toISOString()
  const today = todayISO()
  try {
    const confirmed = await transitionBooking(
      booking.id,
      { status: ["pending", "expired"] },
      {
        status: "confirmed",
        confirmed_at: now,
        expires_at: null,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_method_id: idOf(paymentIntent.payment_method),
        stripe_customer_id: idOf(session.customer) ?? booking.stripe_customer_id,
        amount_paid: fromStripeAmount(session.amount_total ?? 0),
        balance_status: booking.payment_option === "deposit" && booking.balance_amount > 0 ? "scheduled" : "not_required",
        // Ha az indulás már az emlékeztető időablakán belül van, a visszaigazolás pótolja az emlékeztetőt.
        reminder_sent_at: nightsBetween(today, booking.check_in) <= camper.booking.reminderDaysBefore ? now : null,
      },
    )
    if (!confirmed) {
      const fresh = (await findBookingById(booking.id)) ?? booking
      return { state: fresh.status === "confirmed" ? "confirmed" : "cancelled", booking: fresh }
    }
    await notifyBookingConfirmed(confirmed)
    return { state: "confirmed", booking: confirmed }
  } catch (error) {
    if (!(error instanceof BookingConflictError)) throw error

    // A vendég a zárolás lejárta után fizetett, és az időszakot közben más lefoglalta.
    await stripe().refunds.create(
      { payment_intent: paymentIntent.id, metadata: metadata(booking, "booking") },
      { idempotencyKey: `conflict-refund-${booking.id}` },
    )
    const cancelled = await transitionBooking(
      booking.id,
      { status: ["pending", "expired"] },
      {
        status: "cancelled",
        cancelled_at: now,
        cancellation_reason: "conflict",
        stripe_payment_intent_id: paymentIntent.id,
      },
    )
    if (cancelled) await notifyConflict(cancelled)
    return { state: "conflict", booking: cancelled ?? booking }
  }
}

/** A Stripe fizetési oldal lejárt vagy a fizetés végleg meghiúsult → a dátumok felszabadulnak. */
export async function releaseCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.metadata?.booking_id
  if (!bookingId || session.metadata?.kind !== "booking") return
  await transitionBooking(bookingId, { status: ["pending"] }, { status: "expired" })
}

/** A vendég a Stripe oldalon a „Vissza” gombot választotta. */
export async function cancelPendingByGuest(reference: string, token: string | null) {
  const booking = await findBookingByReference(reference, token)
  if (!booking) return { state: "not_found" as const }
  if (booking.status !== "pending") return { state: booking.status, booking }

  if (booking.stripe_checkout_session_id) {
    const session = await stripe().checkout.sessions.retrieve(booking.stripe_checkout_session_id)
    if (session.status === "complete") return { state: "paid" as const, booking }
    if (session.status === "open") await stripe().checkout.sessions.expire(session.id)
  }
  await transitionBooking(booking.id, { status: ["pending"] }, { status: "expired" })
  return { state: "released" as const, booking }
}

// ─── Hátralék (előleges fizetés) ──────────────────────────────────────────

export async function markBalancePaid(b: BookingRow, paymentIntentId: string): Promise<BookingRow | null> {
  const updated = await transitionBooking(
    b.id,
    { status: ["confirmed"], balanceStatus: ["scheduled", "processing", "failed"] },
    {
      balance_status: "paid",
      stripe_balance_payment_intent_id: paymentIntentId,
      amount_paid: b.amount_due_now + b.balance_amount,
    },
  )
  if (updated) await notifyBalancePaid(updated)
  return updated
}

export async function markBalanceFailed(b: BookingRow, reason: string, paymentIntentId?: string | null) {
  const updated = await transitionBooking(
    b.id,
    { status: ["confirmed"], balanceStatus: ["scheduled", "processing"] },
    { balance_status: "failed", ...(paymentIntentId ? { stripe_balance_payment_intent_id: paymentIntentId } : {}) },
  )
  if (updated) await notifyBalanceFailed(updated, reason)
  return updated
}

/** Webhook: a hátralék (automatikus vagy linkes) fizetésének eredménye. */
export async function handleBalancePaymentIntent(pi: Stripe.PaymentIntent) {
  if (pi.metadata?.kind !== "balance" || !pi.metadata.booking_id) return
  const booking = await findBookingById(pi.metadata.booking_id)
  if (!booking) return
  if (pi.status === "succeeded") await markBalancePaid(booking, pi.id)
  else await markBalanceFailed(booking, pi.last_payment_error?.message ?? pi.status, pi.id)
}

/** Napi feladat: a lejárt esedékességű hátralékok levonása az elmentett kártyáról. */
export async function chargeDueBalances(today: string) {
  const due = await listBookings({ status: "confirmed", balanceStatus: "scheduled", balanceDueOnOrBefore: today })
  const result = { charged: 0, failed: 0 }

  for (const booking of due) {
    // Előbb „lefoglaljuk” a feladatot, hogy párhuzamos futás se terheljen kétszer.
    const claimed = await transitionBooking(
      booking.id,
      { status: ["confirmed"], balanceStatus: ["scheduled"] },
      { balance_status: "processing" },
    )
    if (!claimed) continue

    if (!claimed.stripe_customer_id || !claimed.stripe_payment_method_id) {
      await markBalanceFailed(claimed, "nincs elmentett kártya")
      result.failed++
      continue
    }

    try {
      const pi = await stripe().paymentIntents.create(
        {
          amount: toStripeAmount(claimed.balance_amount),
          currency,
          customer: claimed.stripe_customer_id,
          payment_method: claimed.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          description: `${camper.name} foglalás ${claimed.reference} – fennmaradó összeg`,
          metadata: metadata(claimed, "balance"),
        },
        { idempotencyKey: `balance-${claimed.id}` },
      )
      if (pi.status === "succeeded") {
        await markBalancePaid(claimed, pi.id)
        result.charged++
      } else if (pi.status === "processing") {
        await updateBooking(claimed.id, { stripe_balance_payment_intent_id: pi.id })
      } else {
        await markBalanceFailed(claimed, pi.status, pi.id)
        result.failed++
      }
    } catch (error) {
      const reason = error instanceof Stripe.errors.StripeError ? error.message : "ismeretlen hiba"
      const piId = error instanceof Stripe.errors.StripeError ? (error.payment_intent?.id ?? null) : null
      await markBalanceFailed(claimed, reason, piId)
      result.failed++
    }
  }
  return result
}

/** Új Stripe fizetési oldal a sikertelen automatikus levonás pótlására. */
export async function startBalanceCheckout(b: BookingRow): Promise<string> {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    ...(b.stripe_customer_id ? { customer: b.stripe_customer_id } : { customer_email: b.guest_email }),
    client_reference_id: b.id,
    payment_method_types: ["card"],
    locale: "hu",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: toStripeAmount(b.balance_amount),
          product_data: {
            name: `${camper.name} lakóautó-bérlés – fennmaradó összeg`,
            description: `${formatRange(b.check_in, b.check_out)} · ${b.reference}`,
            images: productImages(),
          },
        },
      },
    ],
    payment_intent_data: {
      description: `${camper.name} foglalás ${b.reference} – fennmaradó összeg`,
      metadata: metadata(b, "balance"),
    },
    metadata: metadata(b, "balance"),
    success_url: `${env.siteUrl}/foglalas/sikeres?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.siteUrl,
  })
  if (!session.url) throw new Error("A Stripe nem adott vissza fizetési URL-t.")
  return session.url
}

// ─── Emlékeztetők ─────────────────────────────────────────────────────────

export async function sendDueReminders(today: string) {
  const upcoming = await listBookings({
    status: "confirmed",
    checkInFrom: today,
    checkInTo: addDaysISO(today, camper.booking.reminderDaysBefore),
    reminderNotSent: true,
  })
  for (const booking of upcoming) {
    await notifyReminder(booking, nightsBetween(today, booking.check_in))
    await updateBooking(booking.id, { reminder_sent_at: new Date().toISOString() })
  }
  return upcoming.length
}
