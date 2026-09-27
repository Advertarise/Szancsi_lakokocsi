import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { camper } from "@/content/camper"

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek",
  alternates: { canonical: "/aszf/" },
}

export default function TermsPage() {
  return <LegalPage title="Általános Szerződési Feltételek" sections={camper.legal.terms} />
}
