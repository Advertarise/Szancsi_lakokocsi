"use client"

import type { ReactNode } from "react"
import { CalendarDaysIcon, ShieldCheckIcon } from "lucide-react"

import { useBooking } from "@/components/booking/booking-provider"
import { useMoney } from "@/components/shared/money"
import { camper } from "@/content/camper"
import { formatDate, formatDateShort } from "@/lib/dates"
import { lowestNightlyRate, paymentPlan, type PaymentOption } from "@/lib/pricing"
import { cn } from "@/lib/utils"

function Line({ label, value, hint, strong }: { label: ReactNode; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className={cn("text-sm", strong ? "font-semibold" : "text-muted-foreground")}>
        {label}
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </dt>
      <dd className={cn("text-right text-sm whitespace-nowrap tabular-nums", strong && "font-semibold")}>{value}</dd>
    </div>
  )
}

export function PriceSummary({
  children,
  paymentOption,
  className,
}: {
  /** Gombok az összegzés alján */
  children?: ReactNode
  /** A foglalási oldalon a választott fizetési mód szerinti „most fizetendő” összeg */
  paymentOption?: PaymentOption
  className?: string
}) {
  const { checkIn, checkOut, quote } = useBooking()
  const { format, approx } = useMoney()
  const plan = quote && paymentOption ? paymentPlan(quote, paymentOption) : null

  return (
    <section
      aria-labelledby="arosszesito-cim"
      className={cn("rounded-2xl border border-border/80 bg-card p-5 shadow-xl shadow-black/5 sm:p-6", className)}
    >
      <h2 id="arosszesito-cim" className="sr-only">
        Árösszesítő
      </h2>
      <p className="flex items-baseline gap-1.5">
        {quote ? (
          <>
            <span className="font-heading text-2xl font-semibold">{format(quote.total)}</span>
            <span className="text-sm text-muted-foreground">/ {quote.nights} éj</span>
          </>
        ) : (
          <>
            <span className="font-heading text-2xl font-semibold">{format(lowestNightlyRate)}</span>
            <span className="text-sm text-muted-foreground">-tól / éj</span>
          </>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border">
        {[
          { label: "Érkezés", value: checkIn, time: camper.pickup.pickupWindow },
          { label: "Távozás", value: checkOut, time: camper.pickup.returnWindow },
        ].map((d, i) => (
          <div key={d.label} className={cn("p-3", i === 1 && "border-l")}>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{d.label}</p>
            <p className="mt-0.5 text-sm font-medium">
              {d.value ? formatDateShort(d.value) : <span className="text-muted-foreground">Válassz dátumot</span>}
            </p>
            {d.value && (
              <p className="text-xs text-muted-foreground">
                {d.time.from}–{d.time.to}
              </p>
            )}
          </div>
        ))}
      </div>

      {quote ? (
        <>
          <div className="mt-4 divide-y divide-border/60">
            <dl className="pb-2">
              {quote.nightGroups.map((g) => (
                <Line
                  key={`${g.label}-${g.rate}`}
                  label={`${g.nights} éj × ${format(g.rate)}`}
                  hint={quote.nightGroups.length > 1 || g.label !== "Alapár" ? g.label : undefined}
                  value={format(g.total)}
                />
              ))}
              <Line label="Takarítási díj" value={format(quote.cleaningFee)} />
              {quote.extras.map((e) => (
                <Line
                  key={e.id}
                  label={e.name}
                  hint={e.unit === "perNight" ? `${e.quantity} éj × ${format(e.unitPrice)}` : "egyszeri díj"}
                  value={format(e.total)}
                />
              ))}
            </dl>
            <dl className="py-2">
              <Line label="Összesen" value={format(quote.total)} strong />
              <Line
                label="Kaució"
                hint="átvételkor fizetendő, visszajár"
                value={format(quote.securityDeposit)}
              />
            </dl>
            {plan ? (
              <dl className="pt-2">
                <Line
                  label={plan.payLater > 0 ? "Előleg" : "Fizetendő"}
                  hint="a visszaigazolás után"
                  value={format(plan.payNow)}
                  strong
                />
                {plan.payLater > 0 && plan.payLaterDate && (
                  <Line label="Hátralék" hint={`${formatDate(plan.payLaterDate)}-ig`} value={format(plan.payLater)} />
                )}
              </dl>
            ) : (
              quote.depositAvailable && (
                <p className="pt-3 text-xs leading-relaxed text-muted-foreground">
                  Fizethetsz {camper.pricing.depositPercent}% előleget is ({format(quote.depositAmount)}), ilyenkor a fennmaradó
                  összeget {formatDate(quote.balanceDueDate as string)}-ig kell rendezni.
                </p>
              )
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          <CalendarDaysIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Válaszd ki az érkezés és a távozás napját a naptárban, és itt azonnal látod a teljes árat.
        </p>
      )}

      {children && <div className="mt-5">{children}</div>}

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Most még nem fizetsz: a foglalási kérést e-mailben visszaigazoljuk.{" "}
          {approx && "Az euróban mutatott árak tájékoztató jellegűek, a fizetés forintban történik."}
        </span>
      </p>
    </section>
  )
}
