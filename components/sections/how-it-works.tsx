import { Icon } from "@/components/shared/icon"
import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { camper } from "@/content/camper"

export function HowItWorks() {
  return (
    <Section id="hogyan-mukodik" tone="surface">
      <SectionHeading
        id="hogyan-mukodik"
        eyebrow="Hogyan működik"
        title="Három lépés a kalandig"
        intro="Nincs papírmunka és várakozás – a foglalástól az indulásig minden egyszerű."
      />
      <div className="relative">
        <div aria-hidden="true" className="absolute top-14 right-[16%] left-[16%] hidden border-t-2 border-dashed border-sunset/40 md:block" />
        <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
          {camper.howItWorks.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal delay={i * 0.12} className="h-full">
                <div className="flex h-full flex-col items-center rounded-2xl border border-border/80 bg-card p-6 text-center shadow-sm sm:p-8">
                  <span className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Icon name={step.icon} className="size-8" />
                    <span className="absolute -top-1 -right-1 flex size-8 items-center justify-center rounded-full bg-sunset font-heading text-sm font-bold text-sunset-foreground ring-4 ring-card">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
      </ol>
      </div>
    </Section>
  )
}
