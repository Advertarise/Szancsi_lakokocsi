import "server-only"

import { Resend } from "resend"

import { camper } from "@/content/camper"
import { emailConfigured, env } from "@/lib/server/env"

let client: Resend | null = null

export interface OutgoingEmail {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  attachments?: { filename: string; content: string; contentType?: string }[]
  /** Ugyanazzal a kulccsal a Resend 24 órán belül nem küldi el újra (webhook-ismétlés ellen). */
  idempotencyKey?: string
}

export function ownerEmail(): string {
  return env.ownerEmail ?? camper.contact.email
}

export async function sendEmail(email: OutgoingEmail): Promise<void> {
  if (!emailConfigured()) {
    console.warn(`[email] A Resend nincs beállítva, kihagyva: "${email.subject}" → ${email.to}`)
    return
  }
  client ??= new Resend(env.resendApiKey)
  const { error } = await client.emails.send(
    {
      from: env.emailFrom as string,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: email.replyTo ?? camper.contact.email,
      attachments: email.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "utf8"),
        contentType: a.contentType,
      })),
    },
    email.idempotencyKey ? { idempotencyKey: email.idempotencyKey } : undefined,
  )
  // Az e-mail hibája ne akassza meg a foglalást; a hibát naplózzuk.
  if (error) console.error(`[email] Sikertelen küldés: "${email.subject}" → ${email.to}`, error)
}
