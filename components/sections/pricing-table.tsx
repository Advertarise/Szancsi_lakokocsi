import { BrushCleaningIcon, GaugeIcon, PercentIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Money } from "@/components/shared/money"
import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { camper } from "@/content/camper"
import { formatMonthDay } from "@/lib/dates"

export function PricingTable() {
  const { pricing } = camper
  const fees: { icon: LucideIcon; title: string; value: ReactNode; text: string }[] = [
    {
      icon: BrushCleaningIcon,
      title: "Takarítási díj",
      value: <Money amount={pricing.cleaningFee} />,
      text: "Egyszeri díj foglalásonként – a mosogatást és a tartályok ürítését viszont kérjük.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Kaució",
      value: <Money amount={pricing.securityDeposit.amount} />,
      text: pricing.securityDeposit.note,
    },
    ...(pricing.depositPercent > 0
      ? [
          {
            icon: PercentIcon,
            title: "Rugalmas fizetés",
            value: `${pricing.depositPercent}% előleg`,
            text: `A visszaigazolás után elég az előleget elutalni, a maradékot legkésőbb ${pricing.balanceDueDaysBefore} nappal indulás előtt kell rendezni.`,
          },
        ]
      : []),
    ...(pricing.includedKmPerDay
      ? [
          {
            icon: GaugeIcon,
            title: "Kilométer",
            value: `${pricing.includedKmPerDay} km / nap`,
            text: pricing.extraKmFee
              ? `Az árban benne van. Felette ${pricing.extraKmFee} Ft/km, vagy válaszd a Korlátlan kilométer extrát.`
              : "Az árban benne van.",
          },
        ]
      : []),
  ]

  return (
    <Section id="arak">
      <SectionHeading
        id="arak"
        eyebrow="Árak és szezonok"
        title="Átlátható árak, rejtett költségek nélkül"
        intro="Az ár éjszakánként értendő, és tartalmazza a biztosítást, az assistance-t és a teljes felszerelést."
      />

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div>
            <table className="w-full text-left">
              <caption className="sr-only">Szezonális éjszakai árak és minimum foglalási idő</caption>
              <thead className="bg-muted text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold sm:px-6">Időszak</th>
                  <th scope="col" className="hidden px-5 py-4 font-semibold sm:table-cell sm:px-6">Dátumok</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold sm:px-6">Ár / éj</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold sm:px-6">
                    Min.<span className="hidden sm:inline"> éjszaka</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {pricing.seasons.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-muted/50">
                    <th scope="row" className="px-5 py-4 font-medium sm:px-6">
                      {s.name}
                      <span className="block text-sm font-normal text-muted-foreground sm:hidden">
                        {formatMonthDay(s.from)} – {formatMonthDay(s.to)}
                      </span>
                      {s.description && (
                        <span className="hidden text-sm font-normal text-muted-foreground sm:block">{s.description}</span>
                      )}
                    </th>
                    <td className="hidden px-5 py-4 text-sm whitespace-nowrap sm:table-cell sm:px-6">
                      {formatMonthDay(s.from)} – {formatMonthDay(s.to)}
                    </td>
                    <td className="px-5 py-4 text-right font-heading text-lg font-semibold whitespace-nowrap sm:px-6">
                      <Money amount={s.nightlyPrice} />
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums sm:px-6">{s.minNights ?? pricing.minNights} éj</td>
                  </tr>
                ))}
                <tr className="transition-colors hover:bg-muted/50">
                  <th scope="row" className="px-5 py-4 font-medium sm:px-6">
                    Alapár
                    <span className="block text-sm font-normal text-muted-foreground">Minden más időszakban</span>
                  </th>
                  <td className="hidden px-5 py-4 text-sm sm:table-cell sm:px-6">Egész évben</td>
                  <td className="px-5 py-4 text-right font-heading text-lg font-semibold whitespace-nowrap sm:px-6">
                    <Money amount={pricing.baseNightlyPrice} />
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums sm:px-6">{pricing.minNights} éj</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fees.map((f, i) => (
          <li key={f.title}>
            <Reveal delay={i * 0.06} className="h-full">
              <div className="h-full rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <f.icon className="mb-3 size-6 text-sunset-ink" aria-hidden="true" />
                <h3 className="font-sans text-sm font-medium text-muted-foreground">{f.title}</h3>
                <p className="mt-1 font-heading text-xl font-semibold">{f.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
