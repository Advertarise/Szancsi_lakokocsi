import Image from "next/image"
import { ArrowDownIcon, BedDoubleIcon, CogIcon, PawPrintIcon, UsersIcon } from "lucide-react"

import { Money } from "@/components/shared/money"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { camper } from "@/content/camper"
import { lowestNightlyRate } from "@/lib/pricing"

export function Hero() {
  const { specs } = camper
  const facts = [
    { icon: UsersIcon, label: `${specs.seats} fő` },
    { icon: BedDoubleIcon, label: `${specs.berths} alvóhely` },
    { icon: CogIcon, label: specs.transmission === "automatic" ? "Automata váltó" : "Manuális váltó" },
    ...(specs.petsAllowed ? [{ icon: PawPrintIcon, label: "Kisállatbarát" }] : []),
  ]

  return (
    <section aria-labelledby="hero-cim" className="relative isolate flex min-h-svh items-end overflow-hidden text-white">
      <Image
        src={camper.hero.image}
        alt={camper.hero.alt}
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-[70%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />

      <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-28 sm:px-6 lg:pb-24">
        <Reveal y={16}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <span className="size-2 rounded-full bg-sunset" aria-hidden="true" />
            {camper.hero.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 id="hero-cim" className="max-w-3xl text-5xl leading-[1.04] font-semibold text-balance sm:text-6xl lg:text-7xl">
            {camper.slogan}
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-white/90 sm:text-xl">
            {camper.shortDescription}
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="sunset" size="xl">
              <a href="#foglalas">
                Foglalj most
                <ArrowDownIcon data-icon="inline-end" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white dark:border-white/40 dark:bg-white/10"
            >
              <a href="#galeria">Nézz körül</a>
            </Button>
            <p className="w-full text-sm text-white/85 sm:ml-2 sm:w-auto">
              <Money amount={lowestNightlyRate} className="text-base font-semibold text-white" />
              -tól / éj
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/20 pt-6 text-sm font-medium text-white/90">
            {facts.map(({ icon: FactIcon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <FactIcon className="size-4 text-[#f2a36b]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
