import { camper } from "@/content/camper"

export type CurrencyCode = "HUF" | "EUR"

export const baseCurrency: CurrencyCode = camper.pricing.currency

/** Van-e értelme tájékoztató EUR árakat mutatni. */
export const eurDisplayAvailable = baseCurrency === "HUF" && !!camper.pricing.eurRate

export function convert(amount: number, to: CurrencyCode): number {
  if (to === baseCurrency) return amount
  const rate = camper.pricing.eurRate ?? 1
  return to === "EUR" ? amount / rate : amount * rate
}

const formatters = new Map<string, Intl.NumberFormat>()

function formatter(currency: CurrencyCode, decimals: number) {
  const key = `${currency}-${decimals}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(key, f)
  }
  return f
}

/** Az alap pénznemben megadott összeg formázása a kért pénznemben, pl. "45 000 Ft" vagy "114 €". */
export function formatMoney(amount: number, display: CurrencyCode = baseCurrency): string {
  const value = convert(amount, display)
  return formatter(display, 0).format(Math.round(value))
}

/** Rövid alak a naptár napjaihoz: "45e" vagy "€114". */
export function formatCompact(amount: number, display: CurrencyCode = baseCurrency): string {
  const value = convert(amount, display)
  if (display === "EUR") return `€${Math.round(value)}`
  const thousands = value / 1000
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1).replace(".", ",")}e`
}

/**
 * A Stripe a HUF-ot és az EUR-t is kéttizedes pénznemként kezeli, ezért a
 * forint- vagy euróösszeget ×100 kell átadni (HUF esetén a fillér mindig 00).
 */
export function toStripeAmount(amount: number): number {
  return Math.round(amount) * 100
}

export function fromStripeAmount(amount: number): number {
  return Math.round(amount / 100)
}
