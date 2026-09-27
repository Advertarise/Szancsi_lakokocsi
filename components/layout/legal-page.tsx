import type { ReactNode } from "react"

import { PageShell } from "@/components/layout/page-shell"
import { camper } from "@/content/camper"
import type { LegalSection } from "@/lib/camper-types"
import { formatDate } from "@/lib/dates"

export function LegalPage({
  title,
  intro,
  sections = [],
  children,
}: {
  title: string
  intro?: string
  sections?: LegalSection[]
  children?: ReactNode
}) {
  const { operator, lastUpdated } = camper.legal
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-12">
        <header className="border-b pb-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-sunset-ink uppercase">{camper.name}</p>
          <h1 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Hatályos: {formatDate(lastUpdated)} · {operator.name}, {operator.address}
            {operator.taxNumber && ` · Adószám: ${operator.taxNumber}`}
            {operator.registrationNumber && ` · ${operator.registrationNumber}`}
          </p>
          {intro && <p className="mt-6 text-lg leading-relaxed">{intro}</p>}
        </header>
        <div className="mt-8 space-y-8">
          {children}
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PageShell>
  )
}
