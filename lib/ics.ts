import { TZDate } from "@date-fns/tz"

import { camper } from "@/content/camper"
import { TIME_ZONE, formatDate } from "@/lib/dates"

function toUtcStamp(isoDate: string, time: string): string {
  const [y, m, d] = isoDate.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  const instant = new Date(new TZDate(y, m - 1, d, hh, mm, TIME_ZONE).getTime())
  return instant.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1")
}

/** RFC 5545: a sorok legfeljebb 75 bájtosak lehetnek, a folytatósor szóközzel kezdődik. */
function fold(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ""
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    if (bytes + size > 73) {
      parts.push(current)
      current = " "
      bytes = 1
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join("\r\n")
}

export function buildBookingIcs(booking: { reference: string; checkIn: string; checkOut: string }): string {
  const { pickup } = camper
  const description = [
    `Foglalási azonosító: ${booking.reference}`,
    `Átvétel: ${formatDate(booking.checkIn)} ${pickup.pickupWindow.from}–${pickup.pickupWindow.to}`,
    `Visszaadás: ${formatDate(booking.checkOut)} ${pickup.returnWindow.from}–${pickup.returnWindow.to}`,
    `Helyszín: ${pickup.address}`,
    `Kérdés esetén: ${camper.contact.phone} · ${camper.contact.email}`,
  ].join("\n")

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${camper.name}//Foglalas//HU`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@${camper.name.toLowerCase()}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${toUtcStamp(booking.checkIn, pickup.pickupWindow.from)}`,
    `DTEND:${toUtcStamp(booking.checkOut, pickup.returnWindow.to)}`,
    `SUMMARY:${escapeText(`${camper.name} lakóautó – ${booking.reference}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(pickup.address)}`,
    `GEO:${pickup.lat};${pickup.lng}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText("Holnap indul a kaland! Ne felejtsd el a jogosítványt és a személyi igazolványt.")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return lines.map(fold).join("\r\n") + "\r\n"
}
