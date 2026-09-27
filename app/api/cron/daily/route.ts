import { NextResponse } from "next/server"

import { todayISO } from "@/lib/dates"
import { purgeStaleBookings, releaseExpiredHolds, tokenMatches } from "@/lib/server/bookings"
import { bookingConfigured, env } from "@/lib/server/env"
import { chargeDueBalances, sendDueReminders } from "@/lib/server/payments"

/**
 * Naponta egyszer fut (vercel.json → crons). A Vercel automatikusan
 * `Authorization: Bearer <CRON_SECRET>` fejlécet küld.
 *  1. lejárt zárolások felszabadítása
 *  2. esedékes hátralékok levonása (előleges foglalások)
 *  3. emlékeztető e-mailek az indulás előtt
 *  4. régi, ki nem fizetett foglalások törlése
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!env.cronSecret || !tokenMatches(env.cronSecret, auth)) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 401 })
  }
  if (!bookingConfigured()) return NextResponse.json({ error: "A foglalási rendszer nincs beállítva." }, { status: 503 })

  const today = todayISO()
  const result: Record<string, unknown> = { today }
  const steps: [string, () => Promise<unknown>][] = [
    ["releasedHolds", releaseExpiredHolds],
    ["balances", () => chargeDueBalances(today)],
    ["reminders", () => sendDueReminders(today)],
    ["purged", () => purgeStaleBookings()],
  ]

  // Egy lépés hibája ne akadályozza a többit.
  let ok = true
  for (const [name, run] of steps) {
    try {
      result[name] = await run()
    } catch (error) {
      ok = false
      console.error(`[cron] ${name}`, error)
      result[name] = "hiba"
    }
  }

  return NextResponse.json(result, { status: ok ? 200 : 500 })
}
