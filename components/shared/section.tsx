import type { ReactNode } from "react"

import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

export function Section({
  id,
  children,
  className,
  tone = "plain",
  labelledBy,
}: {
  id: string
  children: ReactNode
  className?: string
  tone?: "plain" | "surface"
  labelledBy?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy ?? `${id}-cim`}
      className={cn("py-20 sm:py-28", tone === "surface" && "bg-surface", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  )
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  id: string
  eyebrow: string
  title: string
  intro?: string
  align?: "center" | "left"
}) {
  return (
    <Reveal className={cn("mb-12 max-w-2xl sm:mb-16", align === "center" && "mx-auto text-center")}>
      <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-sunset-ink uppercase">{eyebrow}</p>
      <h2 id={`${id}-cim`} className="text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{intro}</p>}
    </Reveal>
  )
}
