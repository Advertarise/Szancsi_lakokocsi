import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { camper } from "@/content/camper"

export const metadata: Metadata = {
  title: "Adatvédelmi tájékoztató",
  alternates: { canonical: "/adatvedelem" },
}

export default function PrivacyPage() {
  return <LegalPage title="Adatvédelmi tájékoztató" sections={camper.legal.privacy} />
}
