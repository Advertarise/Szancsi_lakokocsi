"use client"

import { useSyncExternalStore } from "react"

import { baseCurrency, eurDisplayAvailable, formatCompact, formatMoney, type CurrencyCode } from "@/lib/money"

const STORAGE_KEY = "display-currency"
const listeners = new Set<() => void>()
let current: CurrencyCode | null = null

function read(): CurrencyCode {
  if (current) return current
  try {
    current = eurDisplayAvailable && localStorage.getItem(STORAGE_KEY) === "EUR" ? "EUR" : baseCurrency
  } catch {
    current = baseCurrency
  }
  return current
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setDisplayCurrency(currency: CurrencyCode) {
  current = currency
  try {
    localStorage.setItem(STORAGE_KEY, currency)
  } catch {
    // nem baj, ha nem menthető
  }
  listeners.forEach((l) => l())
}

/** A látogató által választott megjelenítési pénznem (a fizetés mindig az alap pénznemben történik). */
export function useDisplayCurrency(): CurrencyCode {
  return useSyncExternalStore(subscribe, read, () => baseCurrency)
}

export function useMoney() {
  const currency = useDisplayCurrency()
  const approx = currency !== baseCurrency
  return {
    currency,
    approx,
    format: (amount: number) => `${approx ? "≈ " : ""}${formatMoney(amount, currency)}`,
    compact: (amount: number) => formatCompact(amount, currency),
  }
}

export function Money({ amount, className }: { amount: number; className?: string }) {
  const { format } = useMoney()
  return <span className={className}>{format(amount)}</span>
}

export function CurrencyToggle({ className }: { className?: string }) {
  const currency = useDisplayCurrency()
  if (!eurDisplayAvailable) return null
  return (
    <div role="group" aria-label="Árak pénzneme" className={className}>
      <div className="inline-flex rounded-full border border-current/20 p-0.5 text-xs font-semibold">
        {(["HUF", "EUR"] as const).map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={currency === code}
            onClick={() => setDisplayCurrency(code)}
            className="rounded-full px-2.5 py-1 transition-colors aria-pressed:bg-current/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {code === "HUF" ? "Ft" : "€"}
          </button>
        ))}
      </div>
    </div>
  )
}
