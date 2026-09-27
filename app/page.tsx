import { MobileBookingBar } from "@/components/booking/booking-cta"
import { BookingProvider } from "@/components/booking/booking-provider"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Amenities } from "@/components/sections/amenities"
import { BookingSection } from "@/components/sections/booking-section"
import { Faq } from "@/components/sections/faq"
import { GallerySection } from "@/components/sections/gallery-section"
import { Hero } from "@/components/sections/hero"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Intro } from "@/components/sections/intro"
import { Location } from "@/components/sections/location"
import { PricingTable } from "@/components/sections/pricing-table"
import { Reviews } from "@/components/sections/reviews"
import { JsonLd } from "@/components/shared/json-ld"

export default function HomePage() {
  return (
    <BookingProvider>
      <SiteHeader overlay />
      <main id="tartalom">
        <Hero />
        <Intro />
        <GallerySection />
        <Amenities />
        <BookingSection />
        <PricingTable />
        <HowItWorks />
        <Reviews />
        <Faq />
        <Location />
      </main>
      <SiteFooter mobileBarSpace />
      <MobileBookingBar />
      <JsonLd />
    </BookingProvider>
  )
}
