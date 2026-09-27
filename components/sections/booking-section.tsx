import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { BookingCta } from "@/components/booking/booking-cta"
import { ExtrasPicker } from "@/components/booking/extras-picker"
import { PriceSummary } from "@/components/booking/price-summary"
import { Icon } from "@/components/shared/icon"
import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { camper } from "@/content/camper"

export function extraIcons() {
  return Object.fromEntries(camper.extras.map((e) => [e.id, e.icon ? <Icon name={e.icon} /> : null]))
}

export function BookingSection() {
  return (
    <Section id="foglalas" tone="surface">
      <SectionHeading
        id="foglalas"
        eyebrow="Foglalás"
        title="Mikor indulsz?"
        intro="Válaszd ki az érkezés és a távozás napját. A szürke napok már foglaltak; a napok alatt az adott éjszaka ára látható."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-10">
          <Reveal>
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
              <AvailabilityCalendar />
            </div>
          </Reveal>
          <Reveal>
            <ExtrasPicker icons={extraIcons()} />
          </Reveal>
        </div>
        <div className="lg:sticky lg:top-24">
          <PriceSummary>
            <BookingCta />
          </PriceSummary>
        </div>
      </div>
    </Section>
  )
}
