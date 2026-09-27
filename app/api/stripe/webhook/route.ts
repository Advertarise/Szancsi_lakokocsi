import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { env } from "@/lib/server/env"
import { fulfillCheckoutSession, handleBalancePaymentIntent, releaseCheckoutSession } from "@/lib/server/payments"
import { stripe } from "@/lib/server/stripe"

/**
 * Stripe webhook. A Stripe irányítópultján (Developers → Webhooks) ezekre az
 * eseményekre iratkozz fel:
 *   checkout.session.completed, checkout.session.async_payment_succeeded,
 *   checkout.session.async_payment_failed, checkout.session.expired,
 *   payment_intent.succeeded, payment_intent.payment_failed
 */
export async function POST(request: Request) {
  if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "A Stripe webhook nincs beállítva." }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Hiányzó aláírás." }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, env.stripeWebhookSecret)
  } catch {
    return NextResponse.json({ error: "Érvénytelen aláírás." }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckoutSession(event.data.object.id)
        break
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await releaseCheckoutSession(event.data.object)
        break
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        await handleBalancePaymentIntent(event.data.object)
        break
    }
  } catch (error) {
    // 500-as válaszra a Stripe később újrapróbálja az eseményt.
    console.error(`[webhook] ${event.type} feldolgozása sikertelen`, error)
    return NextResponse.json({ error: "Feldolgozási hiba." }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
