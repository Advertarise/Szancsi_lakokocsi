import "server-only"

import { siteUrl } from "@/lib/site"

function read(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export const env = {
  siteUrl,
  supabaseUrl: read("SUPABASE_URL"),
  supabaseServiceKey: read("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: read("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
  resendApiKey: read("RESEND_API_KEY"),
  emailFrom: read("EMAIL_FROM"),
  ownerEmail: read("OWNER_EMAIL"),
  cronSecret: read("CRON_SECRET"),
}

/** A foglaláshoz az adatbázis és a Stripe is kell. */
export function bookingConfigured(): boolean {
  return !!(env.supabaseUrl && env.supabaseServiceKey && env.stripeSecretKey)
}

export function databaseConfigured(): boolean {
  return !!(env.supabaseUrl && env.supabaseServiceKey)
}

export function emailConfigured(): boolean {
  return !!(env.resendApiKey && env.emailFrom)
}
