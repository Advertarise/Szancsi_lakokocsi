import "server-only"

import Stripe from "stripe"

import { env } from "@/lib/server/env"

let client: Stripe | null = null

export function stripe(): Stripe {
  if (!env.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY nincs beállítva.")
  client ??= new Stripe(env.stripeSecretKey, { appInfo: { name: "RoadNest" } })
  return client
}

/** Stripe objektum vagy annak azonosítója → azonosító. */
export function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}
