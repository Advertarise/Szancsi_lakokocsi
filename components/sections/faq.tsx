import Link from "next/link"

import { Reveal } from "@/components/shared/reveal"
import { Section, SectionHeading } from "@/components/shared/section"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { camper } from "@/content/camper"

export function Faq() {
  return (
    <Section id="gyik" tone="surface">
      <SectionHeading id="gyik" eyebrow="GYIK" title="Gyakori kérdések" />
      <Reveal className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="rounded-2xl border border-border/80 bg-card px-5 shadow-sm sm:px-8">
          {camper.faq.map((item, i) => (
            <AccordionItem key={item.question} value={`kerdes-${i}`}>
              <AccordionTrigger className="py-5 text-left font-sans text-base font-semibold tracking-normal hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-center text-muted-foreground">
          Nem találod a választ?{" "}
          <Link href="/#kapcsolat" className="font-medium text-primary underline underline-offset-4">
            Írj nekünk
          </Link>{" "}
          – {camper.contact.responseTime.charAt(0).toLowerCase() + camper.contact.responseTime.slice(1)}
        </p>
      </Reveal>
    </Section>
  )
}
