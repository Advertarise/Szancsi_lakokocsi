import { Icon } from "@/components/shared/icon"
import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { camper } from "@/content/camper"

export function Amenities() {
  return (
    <Section id="felszereltseg">
      <SectionHeading
        id="felszereltseg"
        eyebrow="Felszereltség"
        title="Minden megvan, amire szükséged lehet"
        intro="Csak a személyes holmidat kell hoznod – a konyhától a napelemig minden az utazásra van tervezve."
      />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {camper.amenities.map((a, i) => (
          <li key={a.label}>
            <Reveal delay={(i % 4) * 0.06} className="h-full">
              <div className="group h-full rounded-2xl border border-border/80 bg-card p-5 shadow-sm shadow-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={a.icon} className="size-6" />
                </span>
                <h3 className="font-sans text-base font-semibold">{a.label}</h3>
                {a.description && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.description}</p>}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
