import { GalleryGrid } from "@/components/sections/gallery"
import { Section, SectionHeading } from "@/components/shared/section"
import { camper } from "@/content/camper"

export function GallerySection() {
  return (
    <Section id="galeria" tone="surface">
      <SectionHeading
        id="galeria"
        eyebrow="Galéria"
        title="Nézz be az ajtón"
        intro="Világos, otthonos belső tér és egy jármű, ami a hegyi utakon is otthon van. Kattints a képekre a nagyobb nézethez."
      />
      <GalleryGrid images={camper.images} />
    </Section>
  )
}
