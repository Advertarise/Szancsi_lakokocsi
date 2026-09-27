import { NextResponse } from "next/server"

import { blockedRangesFromConfig } from "@/lib/availability"
import { getUnavailableRanges } from "@/lib/server/bookings"
import { databaseConfigured } from "@/lib/server/env"

const noStore = { "Cache-Control": "no-store" }

/** Foglalt és blokkolt időszakok – személyes adat nélkül. */
export async function GET() {
  if (!databaseConfigured()) {
    return NextResponse.json({ ranges: blockedRangesFromConfig(), demo: true }, { headers: noStore })
  }
  try {
    return NextResponse.json({ ranges: await getUnavailableRanges() }, { headers: noStore })
  } catch (error) {
    console.error("[availability]", error)
    return NextResponse.json({ error: "Nem sikerült lekérdezni a foglaltságot." }, { status: 500, headers: noStore })
  }
}
