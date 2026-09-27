import { ClockIcon, MailIcon, MapPinIcon, MessageCircleIcon, NavigationIcon, PhoneIcon } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { Button } from "@/components/ui/button"
import { camper } from "@/content/camper"

function osmEmbedUrl(lat: number, lng: number) {
  const d = 0.012
  const bbox = [lng - d * 1.6, lat - d, lng + d * 1.6, lat + d].map((n) => n.toFixed(5)).join(",")
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

export function Location() {
  const { pickup, contact } = camper
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pickup.lat},${pickup.lng}`

  return (
    <Section id="kapcsolat">
      <SectionHeading
        id="kapcsolat"
        eyebrow="Átvétel és kapcsolat"
        title="Itt vár rád a lakóautó"
        intro={contact.responseTime}
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
        <Reveal>
          <div className="relative h-full min-h-80 overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
            <iframe
              title={`Térkép: ${pickup.address}`}
              src={osmEmbedUrl(pickup.lat, pickup.lng)}
              className="absolute inset-0 size-full border-0 dark:brightness-90 dark:contrast-110 dark:invert-[0.9] dark:hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col gap-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
            <div>
              <h3 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                <MapPinIcon className="size-4 text-sunset-ink" aria-hidden="true" /> Átvételi helyszín
              </h3>
              <address className="mt-2 font-heading text-xl font-semibold not-italic">{pickup.address}</address>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pickup.directions}</p>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted p-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <ClockIcon className="size-3.5" aria-hidden="true" /> Átvétel
                </dt>
                <dd className="mt-1 font-semibold">
                  {pickup.pickupWindow.from}–{pickup.pickupWindow.to}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <ClockIcon className="size-3.5" aria-hidden="true" /> Visszaadás
                </dt>
                <dd className="mt-1 font-semibold">
                  {pickup.returnWindow.from}–{pickup.returnWindow.to}
                </dd>
              </div>
            </dl>

            <div className="space-y-3">
              <h3 className="font-sans text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Kérdésed van? {contact.ownerName} válaszol
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" size="lg" className="justify-start">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                    <PhoneIcon data-icon="inline-start" /> {contact.phone}
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="justify-start">
                  <a href={`mailto:${contact.email}`}>
                    <MailIcon data-icon="inline-start" /> E-mail
                  </a>
                </Button>
                {contact.whatsapp && (
                  <Button asChild variant="outline" size="lg" className="justify-start">
                    <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">
                      <MessageCircleIcon data-icon="inline-start" /> WhatsApp
                    </a>
                  </Button>
                )}
                <Button asChild variant="default" size="lg" className="justify-start">
                  <a href={directionsUrl} target="_blank" rel="noopener">
                    <NavigationIcon data-icon="inline-start" /> Útvonaltervezés
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
