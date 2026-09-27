import { NextResponse, type NextRequest } from "next/server"

import { findBookingByReference } from "@/lib/server/bookings"
import { bookingConfigured } from "@/lib/server/env"
import { startBalanceCheckout } from "@/lib/server/payments"

/**
 * Az e-mailben kiküldött link célja, ha a hátralék automatikus levonása nem
 * sikerült: új Stripe fizetési oldalt nyit a fennmaradó összegre.
 */
export async function GET(request: NextRequest) {
  const statusPage = (state: string) => NextResponse.redirect(new URL(`/foglalas/hatralek?allapot=${state}`, request.url), 303)

  const ref = request.nextUrl.searchParams.get("ref")
  const token = request.nextUrl.searchParams.get("t")
  if (!ref || !bookingConfigured()) return statusPage("ismeretlen")

  const booking = await findBookingByReference(ref, token)
  if (!booking || booking.status !== "confirmed") return statusPage("ismeretlen")
  if (booking.balance_status === "paid" || booking.balance_status === "not_required") return statusPage("rendezve")
  if (booking.balance_status !== "failed") return statusPage("folyamatban")

  try {
    return NextResponse.redirect(await startBalanceCheckout(booking), 303)
  } catch (error) {
    console.error("[balance-checkout]", error)
    return statusPage("hiba")
  }
}
