import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { camper } from "@/content/camper"

export const metadata: Metadata = {
  title: "Lemondási feltételek",
  alternates: { canonical: "/lemondasi-feltetelek" },
}

function ruleLabel(rules: { daysBefore: number }[], i: number) {
  const current = rules[i].daysBefore
  const previous = rules[i - 1]?.daysBefore
  if (i === 0) return `Legalább ${current} nappal az érkezés előtt`
  if (current === 0) return `${previous} napon belül`
  return `${current}–${previous - 1} nappal az érkezés előtt`
}

export default function CancellationPage() {
  const { cancellation } = camper.legal
  const rules = [...cancellation.rules].sort((a, b) => b.daysBefore - a.daysBefore)

  return (
    <LegalPage title="Lemondási feltételek" intro={cancellation.intro}>
      <section>
        <h2 className="text-xl font-semibold">A visszatérítés mértéke</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <table className="w-full text-left">
            <caption className="sr-only">Visszatérítés mértéke a lemondás időpontja szerint</caption>
            <thead className="bg-muted text-xs tracking-wider text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Lemondás időpontja</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Visszatérítés</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((r, i) => (
                <tr key={r.daysBefore}>
                  <th scope="row" className="px-5 py-4 font-medium">{ruleLabel(rules, i)}</th>
                  <td className="px-5 py-4 text-right font-heading text-lg font-semibold">{r.refundPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Tudnivalók</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
          {cancellation.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>
            Lemondani e-mailben tudsz:{" "}
            <a href={`mailto:${camper.contact.email}`} className="font-medium text-primary underline underline-offset-4">
              {camper.contact.email}
            </a>
            . Kérjük, add meg a foglalási azonosítódat.
          </li>
        </ul>
      </section>
    </LegalPage>
  )
}
