import { QuoteIcon, StarIcon } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { camper } from "@/content/camper"
import { formatDate } from "@/lib/dates"
import { cn } from "@/lib/utils"

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${rating} / 5 csillag`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          aria-hidden="true"
          className={cn("size-4", n <= Math.round(rating) ? "fill-sunset text-sunset" : "fill-transparent text-border")}
        />
      ))}
    </span>
  )
}

export function Reviews() {
  const reviews = camper.reviews
  if (reviews.length === 0) return null
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <Section id="velemenyek">
      <SectionHeading id="velemenyek" eyebrow="Vélemények" title="Akik már útra keltek vele" />
      <Reveal className="-mt-6 mb-12 flex justify-center">
        <p className="inline-flex items-center gap-3 rounded-full border bg-card px-5 py-2.5 shadow-sm">
          <Stars rating={average} />
          <span className="font-heading text-lg font-semibold">{average.toLocaleString("hu-HU", { maximumFractionDigits: 1 })}</span>
          <span className="text-sm text-muted-foreground">{reviews.length} értékelés alapján</span>
        </p>
      </Reveal>
      <ul className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <li key={`${r.name}-${r.date}`}>
            <Reveal delay={(i % 3) * 0.08} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <QuoteIcon className="size-6 text-sunset/40" aria-hidden="true" />
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-pretty">„{r.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t pt-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-secondary font-heading font-semibold text-primary"
                  >
                    {r.name.replace(/^A\s/, "").charAt(0)}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-muted-foreground">
                      {r.location && `${r.location} · `}
                      <time dateTime={r.date}>{formatDate(r.date, "yyyy. MMMM")}</time>
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
