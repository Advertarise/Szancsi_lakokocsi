import Image from "next/image"
import {
  BedDoubleIcon,
  CalendarIcon,
  CogIcon,
  FuelIcon,
  IdCardIcon,
  PawPrintIcon,
  RulerIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { Section } from "@/components/shared/section"
import { camper } from "@/content/camper"

const meters = (cm: number) => (cm / 100).toLocaleString("hu-HU", { minimumFractionDigits: 2 })

export function Intro() {
  const { specs, vehicle } = camper
  const facts: { icon: LucideIcon; label: string; value: string; hint?: string }[] = [
    { icon: UsersIcon, label: "Férőhely", value: `${specs.seats} fő`, hint: "biztonsági övvel" },
    { icon: BedDoubleIcon, label: "Alvóhely", value: `${specs.berths} fő` },
    { icon: CogIcon, label: "Váltó", value: specs.transmission === "automatic" ? "Automata" : "Manuális" },
    {
      icon: PawPrintIcon,
      label: "Kisállat",
      value: specs.petsAllowed ? "Engedélyezett" : "Nem engedélyezett",
      hint: specs.petsAllowed ? specs.petNote : undefined,
    },
    { icon: FuelIcon, label: "Üzemanyag", value: specs.fuel },
    { icon: RulerIcon, label: "Méretek (h × sz × m)", value: `${meters(specs.lengthCm)} × ${meters(specs.widthCm)} × ${meters(specs.heightCm)} m` },
    { icon: IdCardIcon, label: "Jogosítvány", value: `${specs.licenceCategory} kategória`, hint: `${(specs.weightKg / 1000).toLocaleString("hu-HU")} t össztömeg` },
    { icon: CalendarIcon, label: "Évjárat", value: String(vehicle.year), hint: vehicle.model },
  ]
  const [feature] = camper.images.filter((i) => i.category === "interior")

  return (
    <Section id="bemutatkozas">
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-sunset-ink uppercase">Ismerd meg</p>
            <h2 id="bemutatkozas-cim" className="text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl">
              Otthon, bárhová is vezet az út
            </h2>
          </Reveal>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            {camper.longDescription.map((p, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          {feature && (
            <Reveal delay={0.1} className="mt-10 hidden lg:block">
              <figure className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-xl shadow-black/10">
                <Image src={feature.src} alt={feature.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
              </figure>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-2 gap-3 sm:gap-4">
            {facts.map(({ icon: FactIcon, label, value, hint }) => (
              <div
                key={label}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm shadow-black/5 transition-shadow hover:shadow-md"
              >
                <dt className="text-sm text-muted-foreground">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <FactIcon className="size-5" aria-hidden="true" />
                  </span>
                  {label}
                </dt>
                <dd className="mt-1 font-heading text-lg font-semibold">{value}</dd>
                {hint && <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>}
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}
