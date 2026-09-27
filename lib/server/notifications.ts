import "server-only"

import { buildBookingIcs } from "@/lib/ics"
import type { BookingRow } from "@/lib/server/bookings"
import { ownerEmail, sendEmail } from "@/lib/server/email/send"
import {
  guestBalanceFailedEmail,
  guestBalancePaidEmail,
  guestConfirmedEmail,
  guestConflictEmail,
  guestReminderEmail,
  ownerBalanceFailedEmail,
  ownerConfirmedEmail,
  ownerConflictEmail,
} from "@/lib/server/email/templates"
import { env } from "@/lib/server/env"

export function balancePaymentUrl(b: BookingRow): string {
  return `${env.siteUrl}/api/balance-checkout?ref=${encodeURIComponent(b.reference)}&t=${encodeURIComponent(b.access_token)}`
}

export async function notifyBookingConfirmed(b: BookingRow) {
  const ics = buildBookingIcs({ reference: b.reference, checkIn: b.check_in, checkOut: b.check_out })
  await Promise.all([
    sendEmail({
      to: b.guest_email,
      ...guestConfirmedEmail(b),
      attachments: [{ filename: `${b.reference}.ics`, content: ics, contentType: "text/calendar" }],
      idempotencyKey: `confirmed-guest-${b.id}`,
    }),
    sendEmail({
      to: ownerEmail(),
      ...ownerConfirmedEmail(b),
      replyTo: b.guest_email,
      idempotencyKey: `confirmed-owner-${b.id}`,
    }),
  ])
}

export async function notifyReminder(b: BookingRow, daysLeft: number) {
  await sendEmail({ to: b.guest_email, ...guestReminderEmail(b, daysLeft), idempotencyKey: `reminder-${b.id}` })
}

export async function notifyBalancePaid(b: BookingRow) {
  await sendEmail({ to: b.guest_email, ...guestBalancePaidEmail(b), idempotencyKey: `balance-paid-${b.id}` })
}

export async function notifyBalanceFailed(b: BookingRow, reason: string) {
  await Promise.all([
    sendEmail({ to: b.guest_email, ...guestBalanceFailedEmail(b, balancePaymentUrl(b)), idempotencyKey: `balance-failed-guest-${b.id}` }),
    sendEmail({ to: ownerEmail(), ...ownerBalanceFailedEmail(b, reason), replyTo: b.guest_email, idempotencyKey: `balance-failed-owner-${b.id}` }),
  ])
}

export async function notifyConflict(b: BookingRow) {
  await Promise.all([
    sendEmail({ to: b.guest_email, ...guestConflictEmail(b), idempotencyKey: `conflict-guest-${b.id}` }),
    sendEmail({ to: ownerEmail(), ...ownerConflictEmail(b), replyTo: b.guest_email, idempotencyKey: `conflict-owner-${b.id}` }),
  ])
}
