import { NextResponse } from "next/server"

import { camper } from "@/content/camper"
import { buildUnavailableNights, validateStay } from "@/lib/availability"
import { todayISO } from "@/lib/dates"
import { paymentPlan, quote } from "@/lib/pricing"
import {
  BookingConflictError,
  createHold,
  getUnavailableRanges,
  releaseExpiredHolds,
  transitionBooking,
} from "@/lib/server/bookings"
import { bookingConfigured } from "@/lib/server/env"
import { startCheckout } from "@/lib/server/payments"
import { checkoutRequestSchema, makeBookingFormSchema } from "@/lib/validation"

function fail(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status })
}

/**
 * Foglalás indítása: szerveroldali ellenőrzés és árszámítás, a dátumok
 * zárolása (15 perc), majd átirányítás a Stripe fizetési oldalára.
 */
export async function POST(request: Request) {
  if (!bookingConfigured()) {
    return fail(
      503,
      `Az online foglalás még nincs beállítva. Kérjük, foglalj e-mailben (${camper.contact.email}) vagy telefonon (${camper.contact.phone}).`,
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, "Hibás kérés.")
  }

  const parsed = checkoutRequestSchema.safeParse(body)
  if (!parsed.success) return fail(400, "Hibás foglalási adatok. Kérjük, töltsd újra az oldalt.")
  const { checkIn, checkOut, extras } = parsed.data
  const today = todayISO()

  const form = makeBookingFormSchema({ checkIn, checkOut, today }).safeParse(parsed.data.form)
  if (!form.success) {
    const fields = Object.fromEntries(form.error.issues.map((i) => [String(i.path[0]), i.message]))
    return fail(422, form.error.issues[0]?.message ?? "Ellenőrizd a megadott adatokat.", { fields })
  }
  const data = form.data

  try {
    await releaseExpiredHolds()
    const unavailable = buildUnavailableNights(await getUnavailableRanges())
    const stayError = validateStay({ checkIn, checkOut, unavailable, today })
    if (stayError) return fail(409, stayError, { code: "unavailable" })

    const q = quote({ checkIn, checkOut, extras, today })
    if (data.paymentOption === "deposit" && !q.depositAvailable) {
      return fail(422, "Ennél a foglalásnál már csak a teljes összeg fizethető ki.")
    }
    const plan = paymentPlan(q, data.paymentOption)

    let booking
    try {
      booking = await createHold({
        check_in: checkIn,
        check_out: checkOut,
        guest_name: data.fullName,
        guest_email: data.email.toLowerCase(),
        guest_phone: data.phone,
        guest_birth_date: data.birthDate,
        guest_postal_code: data.postalCode,
        guest_city: data.city,
        guest_street: data.street,
        guest_country: data.country,
        guest_count: data.guestCount,
        licence_number: data.licenceNumber.toUpperCase(),
        licence_country: data.licenceCountry,
        licence_issued_at: data.licenceIssuedAt,
        licence_expires_at: data.licenceExpiresAt,
        notes: data.notes,
        extras: q.extras,
        quote: q,
        currency: camper.pricing.currency,
        total_amount: q.total,
        security_deposit: q.securityDeposit,
        payment_option: plan.option,
        amount_due_now: plan.payNow,
        balance_amount: plan.payLater,
        balance_due_date: plan.payLaterDate,
        terms_accepted_at: new Date().toISOString(),
      })
    } catch (error) {
      if (error instanceof BookingConflictError) return fail(409, error.message, { code: "unavailable" })
      throw error
    }

    try {
      const url = await startCheckout(booking)
      return NextResponse.json({ url, reference: booking.reference })
    } catch (error) {
      console.error("[checkout] Stripe hiba", error)
      await transitionBooking(booking.id, { status: ["pending"] }, { status: "expired" })
      return fail(502, "Nem sikerült elindítani a fizetést. Kérjük, próbáld újra néhány perc múlva.")
    }
  } catch (error) {
    console.error("[checkout]", error)
    return fail(500, "Váratlan hiba történt. Kérjük, próbáld újra, vagy vedd fel velünk a kapcsolatot.")
  }
}
