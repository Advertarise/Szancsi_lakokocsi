import { NextResponse, type NextRequest } from "next/server"

import { buildBookingIcs } from "@/lib/ics"
import { findBookingByReference } from "@/lib/server/bookings"
import { databaseConfigured } from "@/lib/server/env"

/** „Hozzáadás a naptárhoz” – .ics fájl a megerősített foglaláshoz. */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref")
  const token = request.nextUrl.searchParams.get("t")
  if (!ref || !databaseConfigured()) return NextResponse.json({ error: "Nem található." }, { status: 404 })

  const booking = await findBookingByReference(ref, token)
  if (!booking || booking.status !== "confirmed") return NextResponse.json({ error: "Nem található." }, { status: 404 })

  const ics = buildBookingIcs({ reference: booking.reference, checkIn: booking.check_in, checkOut: booking.check_out })
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.reference}.ics"`,
      "Cache-Control": "private, no-store",
    },
  })
}
